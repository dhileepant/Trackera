import axios from 'axios';

const API_URL = '/api/resume';

/**
 * Uploads resume PDF and starts analysis with progress tracking
 */
const analyzeResume = async (file, onUploadProgress) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('resume', file);

    const response = await axios.post(`${API_URL}/analyze`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
        },
        onUploadProgress
    });
    return response.data;
};

/**
 * Fetches user's resume analysis history
 */
const getHistory = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

/**
 * Fetches a specific analysis report by ID
 */
const getAnalysisById = async (id) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

/**
 * Deletes a specific analysis report by ID
 */
const deleteAnalysis = async (id) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const resumeService = {
    analyzeResume,
    getHistory,
    getAnalysisById,
    deleteAnalysis
};

export default resumeService;
