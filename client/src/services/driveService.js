import api from './api';

const driveService = {
    getConnectedDrives: async () => {
        const response = await api.get('/api/drives');
        return response.data;
    },

    getStorageInfo: async () => {
        const response = await api.get('/api/drives/storage');
        return response.data;
    },

    removeDrive: async (driveId) => {
        const response = await api.delete(`/api/drives/${driveId}`);
        return response.data;
    },

    initiateGoogleAuth: () => {
        console.log('Initiating Google OAuth flow');
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No auth token found in localStorage');
            return;
        }
        const timestamp = new Date().getTime();
        const authUrl = `http://localhost:5000/api/google?token=${token}&t=${timestamp}`;
        console.log('Redirecting to:', authUrl);
        window.location.href = authUrl;
    }
};

export default driveService;