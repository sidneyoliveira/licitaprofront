// frontend/src/hooks/useAxios.js

import { useContext, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import AuthContext from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance'; // <-- Importa nossa instância base

const useAxios = () => {
    const { authTokens, setUser, setAuthTokens, logoutUser } = useContext(AuthContext);

    const api = useMemo(() => {
        // Adiciona o interceptor à nossa instância base
        axiosInstance.interceptors.request.use(async req => {
            if (!authTokens) return req;

            const user = jwtDecode(authTokens.access);
            const isExpired = Date.now() >= user.exp * 1000;

            if (!isExpired) {
                req.headers.Authorization = `Bearer ${authTokens.access}`;
                return req;
            }
            
            // Lógica para renovar o token...
            try {
                const response = await axiosInstance.post('/token/refresh/', {
                    refresh: authTokens.refresh
                });
                localStorage.setItem('authTokens', JSON.stringify(response.data));
                setAuthTokens(response.data);
                setUser(jwtDecode(response.data.access));
                req.headers.Authorization = `Bearer ${response.data.access}`;
                return req;
            } catch (error) {
                logoutUser();
                return Promise.reject(error);
            }
        });
        return axiosInstance;
    }, [authTokens, setUser, setAuthTokens, logoutUser]);

    return api;
};

export default useAxios;