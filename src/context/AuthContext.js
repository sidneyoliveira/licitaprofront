// src/context/AuthContext.js

import { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../api/AxiosInstance';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() => localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null);
    const [user, setUser] = useState(() => localStorage.getItem('authTokens') ? jwtDecode(JSON.parse(localStorage.getItem('authTokens')).access) : null);
    
    const navigate = useNavigate();

    // useCallback "memoriza" a função, evitando que ela seja recriada em cada renderização.
    const loginUser = useCallback(async (username, password) => {
        const response = await axiosInstance.post('/token/', { username, password });
        if (response.status === 200) {
            const data = response.data;
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            localStorage.setItem('authTokens', JSON.stringify(data));
            navigate('/');
        }
    }, [navigate]); // A função só será recriada se 'navigate' mudar (o que não acontece)

    // useCallback para a função de logout
    const logoutUser = useCallback(() => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/login');
    }, [navigate]);

    // useMemo "memoriza" o objeto contextData.
    // Ele só será recriado se uma de suas dependências (user, authTokens, etc.) mudar.
    // Isso é o que quebra o loop infinito de renderização.
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