import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../api/AxiosInstance';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() => localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null);
    const [user, setUser] = useState(() => localStorage.getItem('authTokens') ? jwtDecode(JSON.parse(localStorage.getItem('authTokens')).access) : null);
    const navigate = useNavigate();

    const loginUser = useCallback(async (username, password) => {
        try {
            const response = await axiosInstance.post('/token/', { username, password });
            if (response.status === 200) {
                const data = response.data;
                setAuthTokens(data);
                setUser(jwtDecode(data.access));
                localStorage.setItem('authTokens', JSON.stringify(data));
                navigate('/');
            }
        } catch (error) {
            // Se a API retornar um erro (ex: 401 Unauthorized),
            // pega a mensagem de detalhe e a lança para o componente que chamou.
            if (error.response && error.response.data) {
                throw new Error(error.response.data.detail || 'Ocorreu um erro desconhecido.');
            }
            // Para outros erros (ex: rede)
            throw new Error('Não foi possível conectar ao servidor.');
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

