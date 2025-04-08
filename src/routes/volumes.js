const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

// Get all volumes for a user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const volumes = await prisma.volume.findMany({
            where: { userId: req.user.id },
            include: {
                files: {
                    select: {
                        id: true,
                        name: true,
                        size: true,
                        createdAt: true
                    }
                }
            }
        });

        // Convert BigInt to String for JSON serialization
        const serializedVolumes = volumes.map(volume => ({
            ...volume,
            size: volume.size.toString(),
            used: volume.used.toString(),
            files: volume.files.map(file => ({
                ...file,
                size: file.size.toString()
            }))
        }));

        res.json(serializedVolumes);
    } catch (error) {
        console.error('Error fetching volumes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create a new volume
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, size } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!name || !size) {
            return res.status(400).json({ error: 'Name and size are required' });
        }

        // Get all connected drives for the user
        const drives = await prisma.driveAccount.findMany({
            where: { userId }
        });

        if (drives.length === 0) {
            return res.status(400).json({ error: 'No drives connected. Please connect at least one drive.' });
        }

        // Calculate total available storage (15GB per drive)
        const totalStorage = BigInt(drives.length * 15 * 1024 * 1024 * 1024); // Convert to bytes

        // Get all existing volumes and calculate total allocated storage
        const existingVolumes = await prisma.volume.findMany({
            where: { userId }
        });

        const allocatedStorage = existingVolumes.reduce((total, volume) => {
            return total + BigInt(volume.size || 0);
        }, BigInt(0));

        // Calculate remaining storage
        const remainingStorage = totalStorage - allocatedStorage;
        const requestedSize = BigInt(size);

        // Check if there's enough storage available
        if (requestedSize > remainingStorage) {
            return res.status(400).json({ 
                error: 'Insufficient storage available',
                details: {
                    requested: formatBytes(requestedSize.toString()),
                    available: formatBytes(remainingStorage.toString()),
                    total: formatBytes(totalStorage.toString()),
                    allocated: formatBytes(allocatedStorage.toString())
                }
            });
        }

        // Create the volume
        const volume = await prisma.volume.create({
            data: {
                name,
                size: size.toString(),
                userId
            }
        });

        // Convert BigInt to String for JSON serialization
        const serializedVolume = {
            ...volume,
            size: volume.size.toString(),
            used: volume.used.toString()
        };

        res.status(201).json(serializedVolume);
    } catch (error) {
        console.error('Error creating volume:', error);
        res.status(500).json({ 
            error: 'Failed to create volume',
            details: error.message 
        });
    }
});

// Helper function to format bytes
function formatBytes(bytes) {
    if (!bytes || bytes === '0') return '0 Bytes';
    const bytesNum = BigInt(bytes);
    const k = BigInt(1024);
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    let size = bytesNum;

    while (size >= k && i < sizes.length - 1) {
        size = size / k;
        i++;
    }

    return `${Number(size)} ${sizes[i]}`;
}

// Get volume details
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const volume = await prisma.volume.findUnique({
            where: { id: req.params.id },
            include: {
                files: {
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
                }
            }
        });

        if (!volume) {
            return res.status(404).json({ message: 'Volume not found' });
        }

        if (volume.userId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Convert BigInt to String for JSON serialization
        const serializedVolume = {
            ...volume,
            size: volume.size.toString(),
            used: volume.used.toString(),
            files: volume.files.map(file => ({
                ...file,
                size: file.size.toString(),
                chunks: file.chunks.map(chunk => ({
                    ...chunk,
                    size: chunk.size.toString()
                }))
            }))
        };

        res.json(serializedVolume);
    } catch (error) {
        console.error('Error fetching volume:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a volume
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const volume = await prisma.volume.findUnique({
            where: { id: req.params.id }
        });

        if (!volume) {
            return res.status(404).json({ message: 'Volume not found' });
        }

        if (volume.userId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Delete all files and their chunks
        await prisma.volume.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Volume deleted successfully' });
    } catch (error) {
        console.error('Error deleting volume:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router; 