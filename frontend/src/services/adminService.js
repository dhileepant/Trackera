import axios from 'axios';

const API_URL = '/api/admin';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const getAnalytics = async () => (await axios.get(`${API_URL}/analytics`, getHeaders())).data;

export const getStudents = async () => (await axios.get(`${API_URL}/students`, getHeaders())).data;
export const updateStudent = async (id, data) => (await axios.put(`${API_URL}/students/${id}`, data, getHeaders())).data;

export const getCompanies = async () => (await axios.get(`${API_URL}/companies`, getHeaders())).data;
export const createCompany = async (data) => (await axios.post(`${API_URL}/companies`, data, getHeaders())).data;
export const updateCompany = async (id, data) => (await axios.put(`${API_URL}/companies/${id}`, data, getHeaders())).data;
export const deleteCompany = async (id) => (await axios.delete(`${API_URL}/companies/${id}`, getHeaders())).data;

export const getPlacements = async () => (await axios.get(`${API_URL}/placements`, getHeaders())).data;
export const createPlacement = async (data) => (await axios.post(`${API_URL}/placements`, data, getHeaders())).data;
export const updatePlacement = async (id, data) => (await axios.put(`${API_URL}/placements/${id}`, data, getHeaders())).data;

const adminService = {
    getAnalytics,
    getStudents,
    updateStudent,
    getCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    getPlacements,
    createPlacement,
    updatePlacement
};

export default adminService;
