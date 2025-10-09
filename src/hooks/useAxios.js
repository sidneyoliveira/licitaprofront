// frontend/src/hooks/useAxios.js

import axios from 'axios';
import { useContext, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import AuthContext from '../context/AuthContext';
import axiosInstance from '../api/AxiosInstance';

const baseURL = axiosInstance.defaults.baseURL;

const useAxios = () => {
    const { authTokens, setUser, setAuthTokens, logoutUser } = useContext(AuthContext);

    const api = useMemo(() => {
        const instance = axios.create({
            baseURL,
            headers: { Authorization: `Bearer ${authTokens?.access}` }
        });

        instance.interceptors.request.use(async req => {
            // --- CORREÇÃO AQUI ---
            // 1. Adicionar verificação: se não houver token, envia o pedido sem autenticação.
            //    O backend irá então rejeitá-lo com um erro 401, que é o comportamento esperado.
            if (!authTokens) {
                return req;
            }

            const user = jwtDecode(authTokens.access);
            const isExpired = Date.now() >= user.exp * 1000;

            if (!isExpired) return req;

            try {
                const response = await axios.post(`${baseURL}token/refresh/`, {
                    refresh: authTokens.refresh
                });

                localStorage.setItem('authTokens', JSON.stringify(response.data));
                setAuthTokens(response.data);
                setUser(jwtDecode(response.data.access));
                
                req.headers.Authorization = `Bearer ${response.data.access}`;
                return req;

            } catch (error) {
                // Se a renovação falhar, faz logout e rejeita a promessa
                logoutUser();
                return Promise.reject(error);
            }
        });

        return instance;
    }, [authTokens, setUser, setAuthTokens, logoutUser]);

    return api;
};

export default useAxios;