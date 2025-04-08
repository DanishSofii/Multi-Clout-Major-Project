import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, IconButton } from '@mui/material';
import { Folder, InsertDriveFile, CloudDownload, Delete } from '@mui/icons-material';

function FileExplorer() {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('/');

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Files
      </Typography>
      <Typography variant="body1" gutterBottom>
        Current Path: {currentPath}
      </Typography>
      <Grid container spacing={2}>
        {files.map((file, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
              {file.type === 'folder' ? <Folder /> : <InsertDriveFile />}
              <Typography sx={{ ml: 1, flex: 1 }}>{file.name}</Typography>
              <IconButton>
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