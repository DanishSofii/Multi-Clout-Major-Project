import React from 'react';
import { 
    List, 
    ListItem, 
    ListItemIcon, 
    ListItemText, 
    ListItemSecondaryAction,
    IconButton,
    Paper,
    Typography
} from '@mui/material';
import { InsertDriveFile, Download, Delete } from '@mui/icons-material';
import fileService from '../services/fileService';

function FileList({ files, onFileDelete, onRefresh }) {
    const handleDownload = async (fileId, fileName) => {
        try {
            const blob = await fileService.downloadFile(fileId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download error:', error);
        }
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Your Files
            </Typography>
            {files.length > 0 ? (
                <List>
                    {files.map((file) => (
                        <ListItem key={file.id}>
                            <ListItemIcon>
                                <InsertDriveFile />
                            </ListItemIcon>
                            <ListItemText
                                primary={file.name}
                                secondary={`Size: ${formatSize(file.size)}`}
                            />
                            <ListItemSecondaryAction>
                                <IconButton
                                    edge="end"
                                    onClick={() => handleDownload(file.id, file.name)}
                                >
                                    <Download />
                                </IconButton>
                                <IconButton
                                    edge="end"
                                    onClick={() => onFileDelete(file.id)}
                                >
                                    <Delete />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Typography variant="body1" color="text.secondary">
                    No files uploaded yet
                </Typography>
            )}
        </Paper>
    );
}

export default FileList;