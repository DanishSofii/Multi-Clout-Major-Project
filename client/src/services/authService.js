import axios from 'axios';

const API_URL = 'http://localhost:5000';

const authService = {
    register: async (email, password) => {
        const response = await axios.post(`${API_URL}/auth/register`, { email, password });
        return response.data;
    },

    login: async (email, password) => {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        return token && user ? { token, user: JSON.parse(user) } : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    getAuthHeader: () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }
};

export default authService;