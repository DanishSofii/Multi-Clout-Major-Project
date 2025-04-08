const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { google } = require('googleapis');
const config = require('../config/config');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const drives = await prisma.driveAccount.findMany({
            where: {
                userId: req.user.id
            }
        });
        res.json(drives);
    } catch (error) {
        console.error('Error fetching drives:', error);
        res.status(500).json({ message: 'Error fetching drives' });
    }
});

router.get('/storage', authMiddleware, async (req, res) => {
    try {
        const drives = await prisma.driveAccount.findMany({
            where: { userId: req.user.id }
        });

        let totalStorage = 0;
        let usedStorage = 0;

        for (const drive of drives) {
            const oauth2Client = new google.auth.OAuth2(
                config.google.clientId,
                config.google.clientSecret,
                config.google.redirectUri
            );
            oauth2Client.setCredentials({
                access_token: drive.accessToken,
                refresh_token: drive.refreshToken
            });

            const driveApi = google.drive({ version: 'v3', auth: oauth2Client });
            
            try {
                const about = await driveApi.about.get({
                    fields: 'storageQuota'
                });

                const quota = about.data.storageQuota;
                totalStorage += parseInt(quota.limit) || 0;
                usedStorage += parseInt(quota.usage) || 0;
            } catch (driveError) {
                console.error('Error fetching drive quota:', driveError);
                continue; // Skip this drive if there's an error
            }
        }

        res.json({
            total: totalStorage,
            used: usedStorage,
            available: totalStorage - usedStorage
        });
    } catch (error) {
        console.error('Error fetching storage info:', error);
        res.status(500).json({ message: 'Error fetching storage information' });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verify ownership
        const drive = await prisma.driveAccount.findFirst({
            where: {
                id,
                userId: req.user.id
            }
        });
        
        if (!drive) {
            return res.status(404).json({ message: 'Drive not found' });
        }
        
        // Delete the drive account
        await prisma.driveAccount.delete({
            where: { id }
        });
        
        res.json({ message: 'Drive removed successfully' });
    } catch (error) {
        console.error('Error removing drive:', error);
        res.status(500).json({ message: 'Error removing drive' });
    }
});

router.post('/verify', authMiddleware, async (req, res) => {
    try {
        const { driveData } = req.body;
        
        // Decode and parse the drive data
        const decodedData = JSON.parse(Buffer.from(driveData, 'base64').toString());
        
        // Verify that the user ID matches the authenticated user
        if (decodedData.userId !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }
        
        // Create the drive account
        const driveAccount = await prisma.driveAccount.create({
            data: {
                userId: decodedData.userId,
                provider: decodedData.provider,
                accountEmail: decodedData.accountEmail,
                accessToken: decodedData.accessToken,
                refreshToken: decodedData.refreshToken,
                expiresAt: new Date(decodedData.expiresAt)
            }
        });
        
        res.json({
            message: 'Drive account added successfully',
            driveAccount: {
                id: driveAccount.id,
                provider: driveAccount.provider,
                accountEmail: driveAccount.accountEmail
            }
        });
    } catch (error) {
        console.error('Error verifying drive:', error);
        res.status(500).json({ message: 'Error adding drive account' });
    }
});

module.exports = router;