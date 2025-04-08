require('dotenv').config();

module.exports = {
    port: process.env.PORT || 5000,
    google: {
        scopes: ['https://www.googleapis.com/auth/drive'],
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
        credentialsPath: './credentials/oauth2.credentials.json'
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        refreshSecret: process.env.REFRESH_SECRET,
        accessSecret: process.env.ACCESS_SECRET
    },
    storage: {
        tempDir: './temp',
        credentialsDir: './credentials'
    },
    database: {
        url: process.env.DATABASE_URL
    }
};