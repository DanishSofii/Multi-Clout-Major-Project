const express = require('express');
const router = express.Router();
const multer = require('multer');
const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const config = require('../config/config');

const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

async function getAuthenticatedDriveClient(driveAccount) {
    const oauth2Client = new google.auth.OAuth2(
        config.google.clientId,
        config.google.clientSecret,
        config.google.redirectUri
    );

    oauth2Client.setCredentials({
        access_token: driveAccount.accessToken,
        refresh_token: driveAccount.refreshToken,
        expiry_date: driveAccount.expiresAt.getTime()
    });

    // Check if token needs refresh
    if (oauth2Client.isTokenExpiring()) {
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        // Update the stored tokens
        await prisma.driveAccount.update({
            where: { id: driveAccount.id },
            data: {
                accessToken: credentials.access_token,
                refreshToken: credentials.refresh_token || driveAccount.refreshToken,
                expiresAt: new Date(credentials.expiry_date)
            }
        });
    }

    return google.drive({ version: 'v3', auth: oauth2Client });
}

router.get('/', authMiddleware, async (req, res) => {
    try {
        const files = await prisma.file.findMany({
            where: { userId: req.user.id }
        });

        // Convert BigInt to String before sending response
        const serializedFiles = files.map(file => ({
            ...file,
            size: file.size.toString()
        }));

        res.json(serializedFiles);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ message: 'Error fetching files' });
    }
});

router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { volumeId } = req.body;
        if (!volumeId) {
            return res.status(400).json({ message: 'Volume ID is required' });
        }

        // Check if volume exists and belongs to user
        const volume = await prisma.volume.findUnique({
            where: { id: volumeId }
        });

        if (!volume) {
            return res.status(404).json({ message: 'Volume not found' });
        }

        if (volume.userId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if there's enough space in the volume
        if (volume.used + BigInt(req.file.size) > volume.size) {
            return res.status(400).json({ message: 'Not enough space in volume' });
        }

        // Get all available drives
        const drives = await prisma.driveAccount.findMany({
            where: { userId: req.user.id }
        });

        if (drives.length === 0) {
            return res.status(400).json({ message: 'No drives connected' });
        }

        // Calculate chunk size based on number of drives
        const numChunks = drives.length;
        const chunkSize = Math.ceil(req.file.size / numChunks);

        // Create file record
        const file = await prisma.file.create({
            data: {
                name: req.file.originalname,
                path: '/',
                size: BigInt(req.file.size),
                mimeType: req.file.mimetype,
                volumeId: volumeId,
                userId: req.user.id
            }
        });

        // Upload chunks to drives in parallel
        const chunkPromises = drives.map(async (drive, index) => {
            const start = index * chunkSize;
            const end = Math.min(start + chunkSize, req.file.size);
            const chunk = req.file.buffer.slice(start, end);

            // Upload chunk to Google Drive
            const driveClient = await getAuthenticatedDriveClient(drive);

            // Create a readable stream from the buffer
            const stream = require('stream');
            const bufferStream = new stream.PassThrough();
            bufferStream.end(chunk);

            const chunkFile = await driveClient.files.create({
                requestBody: {
                    name: `${file.id}_chunk_${index}`,
                    parents: ['root']
                },
                media: {
                    mimeType: 'application/octet-stream',
                    body: bufferStream
                }
            });

            // Create chunk record
            return prisma.fileChunk.create({
                data: {
                    driveFileId: chunkFile.data.id,
                    size: BigInt(chunk.length),
                    chunkIndex: index,
                    file: {
                        connect: {
                            id: file.id
                        }
                    },
                    driveAccount: {
                        connect: {
                            id: drive.id
                        }
                    }
                }
            });
        });

        // Wait for all chunks to be uploaded
        const chunks = await Promise.all(chunkPromises);

        // Update volume used space
        await prisma.volume.update({
            where: { id: volumeId },
            data: {
                used: volume.used + BigInt(req.file.size)
            }
        });

        // Convert BigInt to String for JSON serialization
        const serializedFile = {
            ...file,
            size: file.size.toString(),
            chunks: chunks.map(chunk => ({
                ...chunk,
                size: chunk.size.toString()
            }))
        };

        res.status(201).json(serializedFile);
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/download/:id', authMiddleware, async (req, res) => {
    try {
        const file = await prisma.file.findUnique({
            where: { id: req.params.id },
            include: {
                chunks: {
                    include: {
                        driveAccount: true
                    },
                    orderBy: {
                        chunkIndex: 'asc'
                    }
                }
            }
        });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        if (file.userId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Download chunks from different drives in parallel
        const chunkPromises = file.chunks.map(async (chunk) => {
            const driveClient = await getAuthenticatedDriveClient(chunk.driveAccount);

            try {
                const response = await driveClient.files.get({
                    fileId: chunk.driveFileId,
                    alt: 'media'
                }, {
                    responseType: 'arraybuffer'
                });

                return Buffer.from(response.data);
            } catch (error) {
                console.error('Error downloading chunk:', error);
                throw error;
            }
        });

        // Wait for all chunks to download
        const chunkBuffers = await Promise.all(chunkPromises);

        // Combine chunks in order
        const fileBuffer = Buffer.concat(chunkBuffers);

        // Set response headers
        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
        res.setHeader('Content-Length', fileBuffer.length);

        // Send the file
        res.end(fileBuffer);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const file = await prisma.file.findUnique({
            where: { id: req.params.id },
            include: {
                chunks: {
                    include: {
                        driveAccount: true
                    }
                }
            }
        });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        if (file.userId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Delete chunks from drives in parallel
        await Promise.all(file.chunks.map(async (chunk) => {
            const driveClient = await getAuthenticatedDriveClient(chunk.driveAccount);

            try {
                await driveClient.files.delete({
                    fileId: chunk.driveFileId
                });
            } catch (error) {
                console.error('Error deleting chunk from drive:', error);
                // Continue with deletion even if one chunk fails
            }
        }));

        // Delete file record and chunks
        await prisma.file.delete({
            where: { id: req.params.id }
        });

        // Update volume usage
        await prisma.volume.update({
            where: { id: file.volumeId },
            data: {
                used: {
                    decrement: file.size
                }
            }
        });

        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;