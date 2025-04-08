import React from 'react';
import { Box, Paper, Typography, LinearProgress } from '@mui/material';

function StorageOverview({ storageInfo }) {
    const usagePercentage = storageInfo.total > 0 
        ? (storageInfo.used / storageInfo.total) * 100 
        : 0;
    
    const getStorageColor = (percentage) => {
        if (percentage > 90) return 'error';
        if (percentage > 70) return 'warning';
        return 'success';
    };

    const formatStorage = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Storage Overview
            </Typography>
            <Box sx={{ mb: 2 }}>
                <LinearProgress 
                    variant="determinate" 
                    value={usagePercentage}
                    color={getStorageColor(usagePercentage)}
                    sx={{ height: 10, borderRadius: 5 }}
                />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                    Used: {formatStorage(storageInfo.used)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Available: {formatStorage(storageInfo.available)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Total: {formatStorage(storageInfo.total)}
                </Typography>
            </Box>
            {storageInfo.total === 0 && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    No storage available. Please connect at least one drive.
                </Typography>
            )}
        </Paper>
    );
}

export default StorageOverview;