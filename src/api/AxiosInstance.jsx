import axios from 'axios';

// Create React App usa process.env.NODE_ENV para detectar o modo
const isDevelopment = process.env.NODE_ENV === 'development';

// As variáveis de ambiente são acessadas via process.env e devem começar com REACT_APP_
const baseURL = isDevelopment 
    ? process.env.REACT_APP_API_BASE_URL_LOCAL 
    : process.env.REACT_APP_API_BASE_URL_DEPLOY;

const axiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 20000,
    headers: {
        "Content-Type": "application/json",
        accept: "application/json"
    }
});

export default axiosInstance;
