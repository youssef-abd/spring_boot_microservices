import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Adresse de la Gateway
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
