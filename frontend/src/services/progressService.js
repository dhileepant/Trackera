import axios from 'axios';

const API_URL = '/api/progress';

export const getProgressAnalytics = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
