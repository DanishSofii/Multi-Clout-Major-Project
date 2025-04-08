import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import driveService from '../services/driveService';

function ConnectDrive() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Use the driveService to initiate Google OAuth
        driveService.initiateGoogleAuth();
    }, [navigate]);

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            gap: 2
        }}>
            <CircularProgress />
            <Typography variant="body1" color="text.secondary">
                Connecting to Google Drive...
            </Typography>
        </Box>
    );
}

export default ConnectDrive;