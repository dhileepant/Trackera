import axios from 'axios';

const API_URL = '/api/ai';

export const sendChatMessage = async (message, context) => {
    const token = localStorage.getItem('token');
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    return axios.post(`${API_URL}/chat`, { message, context }, config);
};
