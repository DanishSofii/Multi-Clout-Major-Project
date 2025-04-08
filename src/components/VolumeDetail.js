import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Typography, Button, List, ListItem, ListItemText, ListItemSecondary, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import FileUploadIcon from '@mui/icons-material/FileUpload';

function VolumeDetail() {
    const [volume, setVolume] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const { id } = useParams();

    const fetchVolume = async () => {
        try {
            const response = await axios.get(`/api/volumes/${id}`);
            setVolume(response.data);
        } catch (error) {
            console.error('Error fetching volume:', error);
        }
    };

    useEffect(() => {
        fetchVolume();
    }, [id]);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('volumeId', id);

        try {
            await axios.post('/api/files/upload', formData);
            fetchVolume(); // Refresh the volume data
            setSelectedFile(null);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleFileDelete = async (fileId) => {
        try {
            await axios.delete(`/api/files/${fileId}`);
            fetchVolume(); // Refresh the volume data
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const handleFileDownload = async (fileId, fileName) => {
        try {
            const response = await axios.get(`/api/files/download/${fileId}`, {
                responseType: 'blob'
            });
            
            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            
            // Create a temporary link element
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            
            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            
            // Clean up the URL
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    if (!volume) {
        return <Typography>Loading...</Typography>;
    }

    const formatSize = (bytes) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Volume: {volume.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
                Used Space: {formatSize(volume.used)} / {formatSize(volume.size)}
            </Typography>

            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                <input
                    type="file"
                    id="file-upload"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
                <label htmlFor="file-upload">
                    <Button
                        variant="contained"
                        component="span"
                        startIcon={<FileUploadIcon />}
                    >
                        Select File
                    </Button>
                </label>
                {selectedFile && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleFileUpload}
                        style={{ marginLeft: '10px' }}
                    >
                        Upload
                    </Button>
                )}
            </div>

            <List>
                {volume.files?.map((file) => (
                    <ListItem
                        key={file.id}
                        secondaryAction={
                            <div>
                                <IconButton 
                                    edge="end" 
                                    aria-label="download"
                                    onClick={() => handleFileDownload(file.id, file.name)}
                                    style={{ marginRight: '8px' }}
                                >
                                    <DownloadIcon />
                                </IconButton>
                                <IconButton 
                                    edge="end" 
                                    aria-label="delete"
                                    onClick={() => handleFileDelete(file.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </div>
                        }
                    >
                        <ListItemText
                            primary={file.name}
                            secondary={`Size: ${formatSize(file.size)}`}
                        />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
}

export default VolumeDetail; 