import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Paper, Button, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';

function DriveVerification() {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [driveData, setDriveData] = useState(null);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const encodedData = searchParams.get('data');

        if (!encodedData) {
            setError('No drive data provided');
            setLoading(false);
            return;
        }

        try {
            const decodedData = JSON.parse(atob(encodedData));
            setDriveData(decodedData);
            setLoading(false);
        } catch (err) {
            setError('Invalid drive data');
            setLoading(false);
        }
    }, [location]);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/drives/verify', 
                { driveData: btoa(JSON.stringify(driveData)) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            navigate('/connect-drive?success=true');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify drive');
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/connect-drive?error=true');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <Paper sx={{ p: 4, maxWidth: 500, width: '100%' }}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                    <Button fullWidth variant="contained" color="primary" onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </Button>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <Paper sx={{ p: 4, maxWidth: 500, width: '100%' }}>
                <Typography variant="h5" gutterBottom>
                    Verify Drive Connection
                </Typography>
                <Typography variant="body1" paragraph>
                    Please confirm the following drive account details:
                </Typography>
                <Box sx={{ mb: 3 }}>
                    <Typography><strong>Email:</strong> {driveData?.accountEmail}</Typography>
                    <Typography><strong>Provider:</strong> {driveData?.provider}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        Confirm
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}

export default DriveVerification;