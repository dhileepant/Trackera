import axios from 'axios';

const API_URL = '/api/practice';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const getCategories = async () => {
    const response = await axios.get(`${API_URL}/categories`, getHeaders());
    return response.data;
};

export const getProblemsByCategory = async (category) => {
    const response = await axios.get(`${API_URL}/category/${encodeURIComponent(category)}`, getHeaders());
    return response.data;
};

export const getProblemDetails = async (problemId) => {
    const response = await axios.get(`${API_URL}/problem/${problemId}`, getHeaders());
    return response.data;
};

export const runCode = async (data) => {
    const response = await axios.post(`${API_URL}/run`, data, getHeaders());
    return response.data;
};

export const submitCode = async (data) => {
    const response = await axios.post(`${API_URL}/submit`, data, getHeaders());
    return response.data;
};
