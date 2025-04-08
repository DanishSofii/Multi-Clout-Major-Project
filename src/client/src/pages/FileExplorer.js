import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Grid, 
  IconButton, 
  Typography,
  Breadcrumbs,
  Link,
  Button
} from '@mui/material';
import { 
  Folder, 
  InsertDriveFile, 
  Delete, 
  CloudDownload, 
  CreateNewFolder 
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

function FileExplorer() {
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadFiles();
  }, [currentPath]);

  const loadFiles = async () => {
    try {
      const response = await api.get(`/files?path=${currentPath}`);
      setFiles(response.data);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const handleFileClick = (file) => {
    if (file.type === 'folder') {
      const newPath = `${currentPath}${file.name}/`;
      setCurrentPath(newPath);
      navigate(newPath);
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await api.get(`/files/download/${file.id}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs>
          {currentPath.split('/').map((part, index, array) => {
            if (!part) return null;
            const path = array.slice(0, index + 1).join('/');
            return (
              <Link
                key={path}
                component="button"
                onClick={() => setCurrentPath(path)}
              >
                {part}
              </Link>
            );
          })}
        </Breadcrumbs>
      </Box>

      <Grid container spacing={2}>
        {files.map((file) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={file.id}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onClick={() => handleFileClick(file)}
            >
              {file.type === 'folder' ? <Folder /> : <InsertDriveFile />}
              <Typography sx={{ ml: 1, flex: 1 }}>{file.name}</Typography>
              <IconButton onClick={() => handleDownload(file)}>
                <CloudDownload />
              </IconButton>
              <IconButton>
                <Delete />
              </IconButton>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default FileExplorer;