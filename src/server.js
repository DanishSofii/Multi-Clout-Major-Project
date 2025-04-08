const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const authRoutes = require('./routes/auth');
const googleRoutes = require('./routes/google');
const drivesRoutes = require('./routes/drives');
const filesRoutes = require('./routes/files');
const volumesRoutes = require('./routes/volumes');
const usersRoutes = require('./routes/users');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api/google', googleRoutes);
app.use('/api/drives', drivesRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/volumes', volumesRoutes);
app.use('/api/users', usersRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Test database connection
async function testDbConnection() {
    try {
        await prisma.$connect();
        console.log('Database connection successful');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

// Health check route
app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Initialize server
async function startServer() {
    try {
        await testDbConnection();
        app.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`);
        });
    } catch (error) {
        console.error('Server startup failed:', error);
        process.exit(1);
    }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Shutting down server...');
    await prisma.$disconnect();
    process.exit(0);
});