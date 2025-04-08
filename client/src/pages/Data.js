// import React, { useEffect, useState } from 'react';
// import { Box, Typography, Grid } from '@mui/material';
// import FileUploader from '../components/FileUploader';
// import FileList from '../components/FileList';
// import fileService from '../services/fileService';

// function Data() {
//     const [files, setFiles] = useState([]);

//     const fetchFiles = async () => {
//         try {
//             const data = await fileService.getFiles();
//             setFiles(data);
//         } catch (error) {
//             console.error('Error fetching files:', error);
//         }
//     };

//     useEffect(() => {
//         fetchFiles();
//     }, []);

//     return (
//         <Box sx={{ p: 3 }}>
//             <Typography variant="h4" gutterBottom>
//                 Data Management
//             </Typography>
//             <Grid container spacing={3}>
//                 <Grid item xs={12}>
//                     <FileUploader onUploadComplete={fetchFiles} />
//                 </Grid>
//                 <Grid item xs={12}>
//                     <FileList 
//                         files={files}
//                         onFileDelete={async (fileId) => {
//                             await fileService.deleteFile(fileId);
//                             fetchFiles();
//                         }}
//                     />
//                 </Grid>
//             </Grid>
//         </Box>
//     );
// }

// export default Data;