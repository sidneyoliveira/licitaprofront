// src/api/config.js
import axios from 'axios';

const BASE_URL = process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_API_BASE_URL_LOCAL || 'http://localhost:8000/api/'
    : 'https://l3solution.net.br/api/';

export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    }
});

export const axiosPublic = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    }
});