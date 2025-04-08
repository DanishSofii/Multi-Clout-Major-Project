const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const stream = require('stream');

const prisma = new PrismaClient();

class FileService {
    static async uploadFile(userId, file, drives) {
        try {
            // Calculate chunk sizes based on drive storage
            const totalSize = file.size;
            const chunks = await this.calculateChunks(totalSize, drives);

            // Create file record
            const fileRecord = await prisma.file.create({
                data: {
                    name: file.originalname,
                    path: '/',
                    size: totalSize,
                    mimeType: file.mimetype,
                    userId
                }
            });

            // Upload chunks to drives
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const drive = drives[chunk.driveIndex];
                
                // Upload chunk to drive
                const driveFileId = await this.uploadChunkToDrive(
                    drive,
                    file.buffer.slice(chunk.start, chunk.end),
                    `${fileRecord.id}_chunk_${i}`
                );

                // Save chunk metadata
                await prisma.fileChunk.create({
                    data: {
                        fileId: fileRecord.id,
                        driveId: drive.id,
                        chunkIndex: i,
                        size: chunk.end - chunk.start,
                        driveFileId
                    }
                });
            }

            return fileRecord;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    static async downloadFile(fileId, userId) {
        try {
            // Get file and chunks
            const file = await prisma.file.findFirst({
                where: { id: fileId, userId },
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
                throw new Error('File not found');
            }

            // Create buffer to hold complete file
            const fileBuffer = Buffer.alloc(Number(file.size));
            let position = 0;

            // Download and combine chunks
            for (const chunk of file.chunks) {
                const chunkData = await this.downloadChunkFromDrive(
                    chunk.driveAccount,
                    chunk.driveFileId
                );

                chunkData.copy(fileBuffer, position);
                position += Number(chunk.size);
            }

            return {
                buffer: fileBuffer,
                name: file.name,
                mimeType: file.mimeType
            };
        } catch (error) {
            console.error('Error downloading file:', error);
            throw error;
        }
    }

    static async calculateChunks(fileSize, drives) {
        const chunks = [];
        let position = 0;

        // Simple round-robin distribution for now
        // Could be improved to consider actual drive storage
        for (let i = 0; position < fileSize; i++) {
            const driveIndex = i % drives.length;
            const chunkSize = Math.min(5 * 1024 * 1024, fileSize - position); // 5MB chunks

            chunks.push({
                driveIndex,
                start: position,
                end: position + chunkSize
            });

            position += chunkSize;
        }

        return chunks;
    }

    static async uploadChunkToDrive(driveAccount, buffer, name) {
        const auth = new google.auth.OAuth2();
        auth.setCredentials({
            access_token: driveAccount.accessToken,
            refresh_token: driveAccount.refreshToken
        });

        const drive = google.drive({ version: 'v3', auth });

        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);

        const response = await drive.files.create({
            requestBody: {
                name,
                mimeType: 'application/octet-stream'
            },
            media: {
                mimeType: 'application/octet-stream',
                body: bufferStream
            }
        });

        return response.data.id;
    }

    static async downloadChunkFromDrive(driveAccount, fileId) {
        const auth = new google.auth.OAuth2();
        auth.setCredentials({
            access_token: driveAccount.accessToken,
            refresh_token: driveAccount.refreshToken
        });

        const drive = google.drive({ version: 'v3', auth });

        const response = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'arraybuffer' }
        );

        return Buffer.from(response.data);
    }
}

module.exports = FileService;