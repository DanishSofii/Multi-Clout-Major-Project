import React, { useState } from 'react';
import { Box, Button, LinearProgress, Typography } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import fileService from '../services/fileService';

function FileUploader({ onUploadComplete }) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        setProgress(0);

        try {
            await fileService.uploadFile(file);
            onUploadComplete?.();
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box sx={{ mb: 3 }}>
            <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />
            <label htmlFor="file-upload">
                <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudUpload />}
                    disabled={uploading}
                >
                    Upload File
                </Button>
            </label>
            {uploading && (
                <Box sx={{ mt: 2 }}>
                    <LinearProgress variant="determinate" value={progress} />
                    <Typography variant="body2" color="text.secondary" align="center">
                        Uploading...
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

export default FileUploader;