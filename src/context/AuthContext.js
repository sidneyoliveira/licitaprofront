// frontend/src/context/AuthContext.js

import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() => localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null);
    const [user, setUser] = useState(() => localStorage.getItem('authTokens') ? jwtDecode(JSON.parse(localStorage.getItem('authTokens')).access) : null);
    const navigate = useNavigate();

    const loginUser = useCallback(async (username, password) => {

        console.log(`[AuthContext] Tentando fazer login na URL: ${axiosInstance.defaults.baseURL}/token/`);

        const response = await axiosInstance.post('/token/', { username, password });
        if (response.status === 200) {
            const data = response.data;
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            localStorage.setItem('authTokens', JSON.stringify(data));
            navigate('/');
        }
    }, [navigate]);

    const logoutUser = useCallback(() => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/login');
    }, [navigate]);

    const contextData = useMemo(() => ({
        user,
        setUser,
        authTokens,
        setAuthTokens,
        loginUser,
        logoutUser,
    }), [user, authTokens, loginUser, logoutUser]);

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;