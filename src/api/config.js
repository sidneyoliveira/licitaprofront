// src/api/config.js
import axios from 'axios';
import { API_BASE_URL } from '../config';


export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    }
});

export const axiosPublic = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    }
});