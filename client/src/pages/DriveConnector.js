import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Google } from '@mui/icons-material';
import authService from '../services/authService';

function DriveConnector() {
    const handleConnectGoogle = () => {
        const token = authService.getCurrentUser()?.token;
        if (!token) {
            console.error('No auth token found');
            return;
        }

        // Include auth token in the request
        window.location.href = `http://localhost:5000/auth/google?token=${token}`;
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Connect Storage
            </Typography>
            <Button
                variant="contained"
                startIcon={<Google />}
                onClick={handleConnectGoogle}
                sx={{ mt: 2 }}
            >
                Connect Google Drive
            </Button>
        </Box>
    );
}

export default DriveConnector;