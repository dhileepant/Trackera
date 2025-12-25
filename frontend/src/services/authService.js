import axios from 'axios';

const API_URL = '/api/auth';

const signup = async (userData) => {
    const response = await axios.post(`${API_URL}/signup`, userData);
    return response.data;
};

const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role);
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
};

const getCurrentUserRole = () => {
    return localStorage.getItem('role');
};

const getProfile = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/student/profile', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const updatePlatforms = async (data) => {
    const token = localStorage.getItem('token');
    const response = await axios.put('/api/student/update-platforms', data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const updateProfile = async (userData) => {
    const token = localStorage.getItem('token');
    const response = await axios.put('/api/student/profile', userData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const syncPlatforms = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.post('/api/student/sync-platforms', {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const getPlatformStats = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/student/platform-stats', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const getActivity = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/student/activity', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const getPlacements = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/student/placements', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const updateActivity = async (data) => {
    const token = localStorage.getItem('token');
    const response = await axios.post('/api/student/activity/update', data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const authService = {
    signup,
    login,
    logout,
    getCurrentUserRole,
    getProfile,
    updatePlatforms,
    updateProfile,
    syncPlatforms,
    getPlatformStats,
    getActivity,
    updateActivity,
    getPlacements
};

export default authService;
