import api from './api';

const fileService = {
    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/api/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    getFiles: async () => {
        const response = await api.get('/api/files');
        return response.data;
    },

    downloadFile: async (fileId) => {
        const response = await api.get(`/api/files/download/${fileId}`, {
            responseType: 'blob'
        });
        return response.data;
    },

    deleteFile: async (fileId) => {
        const response = await api.delete(`/api/files/${fileId}`);
        return response.data;
    }
};

export default fileService;