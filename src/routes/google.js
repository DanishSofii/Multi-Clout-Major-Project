const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

// Define Google OAuth scopes
const SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
];

const oauth2Client = new google.auth.OAuth2(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUri
);

// Update this route to match `/auth/google`
router.get('/', authMiddleware, (req, res) => {
    const token = req.query.token;
    const redirect = req.query.redirect || 'http://localhost:3000/dashboard';
    
    console.log('Initiating Google OAuth flow with token:', token);
    
    const state = Buffer.from(JSON.stringify({
        token,
        redirect
    })).toString('base64');

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        state: state,
        prompt: 'select_account'
    });

    console.log('Generated auth URL:', authUrl);
    res.redirect(authUrl);
});

router.get('/callback', async (req, res) => {
    try {
        console.log('Received callback with query params:', req.query);
        const { code, state } = req.query;
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        const token = stateData.token;
        console.log('Decoded state data:', stateData);

        // Verify and decode the JWT token
        const decoded = jwt.verify(token, config.jwt.secret);
        const userId = decoded.userId;
        console.log('Verified JWT for user ID:', userId);

        // Verify user exists before proceeding
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            console.error('User not found:', userId);
            return res.redirect('http://localhost:3000/connect-drive?error=invalid_user');
        }

        console.log('Fetching OAuth tokens with code:', code);
        const { tokens } = await oauth2Client.getToken(code);
        console.log('Received tokens:', {
            access_token: tokens.access_token ? 'present' : 'missing',
            refresh_token: tokens.refresh_token ? 'present' : 'missing',
            expiry_date: tokens.expiry_date
        });
        oauth2Client.setCredentials(tokens);

        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        const userInfo = await drive.about.get({
            fields: 'user'
        });
        console.log('Retrieved user info:', userInfo.data.user);

        // Check if this specific Google account is already connected
        const existingAccount = await prisma.driveAccount.findFirst({
            where: {
                userId: userId,
                provider: 'google',
                accountEmail: userInfo.data.user.emailAddress
            }
        });

        if (existingAccount) {
            // Update the existing account
            await prisma.driveAccount.update({
                where: { id: existingAccount.id },
                data: {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiresAt: new Date(tokens.expiry_date)
                }
            });
        } else {
            // Create a new drive account
            await prisma.driveAccount.create({
                data: {
                    userId: userId,
                    provider: 'google',
                    accountEmail: userInfo.data.user.emailAddress,
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiresAt: new Date(tokens.expiry_date)
                }
            });
        }

        console.log('Successfully processed Google OAuth callback');
        // Redirect back to the dashboard
        res.redirect(stateData.redirect || 'http://localhost:3000/dashboard');

    } catch (error) {
        console.error('Google auth callback error:', error);
        res.redirect('http://localhost:3000/connect-drive?error=true');
    }
});

module.exports = router;