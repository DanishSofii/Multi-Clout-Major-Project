const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');

class GoogleDriveProvider {
    constructor(credentials) {
        this.credentials = credentials;
        this.drive = null;
        if (credentials) {
            this.initializeDrive();
        }
    }

    initializeDrive() {
        const oauth2Client = new google.auth.OAuth2(
            config.google.clientId,
            config.google.clientSecret,
            config.google.redirectUri
        );

        oauth2Client.setCredentials(this.credentials);
        this.drive = google.drive({ version: 'v3', auth: oauth2Client });
    }

    async uploadFile(filePath, fileName, parentFolderId = null) {
        const fileMetadata = {
            name: fileName,
            ...(parentFolderId && { parents: [parentFolderId] })
        };

        const media = {
            mimeType: 'application/octet-stream',
            body: await fs.createReadStream(filePath)
        };

        const response = await this.drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id'
        });

        return response.data.id;
    }

    async downloadFile(fileId, destinationPath) {
        const dest = fs.createWriteStream(destinationPath);
        const response = await this.drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'stream' }
        );
        
        return new Promise((resolve, reject) => {
            response.data
                .pipe(dest)
                .on('finish', resolve)
                .on('error', reject);
        });
    }

    async deleteFile(fileId) {
        await this.drive.files.delete({ fileId });
    }

    async listFiles(folderId = null) {
        const query = folderId ? `'${folderId}' in parents` : null;
        const response = await this.drive.files.list({
            q: query,
            pageSize: 100,
            fields: 'files(id, name, mimeType, size, modifiedTime)'
        });

        return response.data.files;
    }
}

module.exports = GoogleDriveProvider;