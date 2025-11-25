import { useContext, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
// Importação corrigida (usando chaves para exports nomeados)
import { axiosPublic, axiosInstance } from '../api/config'; 

// Variável fora do hook para garantir que seja um Singleton (compartilhado entre instâncias)
let refreshPromise = null;

const isPublicPath = (url = '') => {
    const u = (url || '').toLowerCase();
    return u.includes('/token/') || u.includes('/google/');
};

const useAxios = () => {
    const { authTokens, setAuthTokens, logoutUser } = useContext(AuthContext);

    const api = useMemo(() => {
        // Cria uma nova instância herdando a baseURL do config global
        const instance = axios.create({
            baseURL: axiosInstance.defaults.baseURL,
            headers: {
                "Content-Type": "application/json",
            }
        });

        // ============================================================
        // 🟢 REQUEST INTERCEPTOR (Verifica expiração antes de enviar)
        // ============================================================
        instance.interceptors.request.use(async (req) => {
            // Se for rota pública, não anexa token
            if (isPublicPath(req.url)) return req;

            const access = authTokens?.access;
            if (!access) return req; 

            // Decodifica para checar expiração
            let isExpired = true;
            try {
                const user = jwtDecode(access);
                // Margem de segurança de 5 segundos
                isExpired = Date.now() >= (user.exp * 1000) - 5000; 
            } catch (error) {
                isExpired = true;
            }

            // Se NÃO expirou, usa o token atual
            if (!isExpired) {
                req.headers.Authorization = `Bearer ${access}`;
                return req;
            }

            // Se expirou, inicia o Refresh Token (Singleton Pattern)
            if (!refreshPromise) {
                console.log("Token expirado. Tentando refresh...");
                refreshPromise = axiosPublic.post('/token/refresh/', {
                    refresh: authTokens?.refresh
                }).then(res => {
                    const newAccess = res.data.access;
                    
                    // Atualiza Contexto e LocalStorage
                    const updatedTokens = { ...authTokens, access: newAccess };
                    setAuthTokens(updatedTokens);
                    localStorage.setItem('authTokens', JSON.stringify(updatedTokens));
                    
                    return newAccess;
                }).catch(err => {
                    console.error("Falha no refresh token:", err);
                    logoutUser();
                    return Promise.reject(err);
                }).finally(() => {
                    refreshPromise = null;
                });
            }

            // Aguarda a promise do refresh terminar (seja a que criamos ou uma já existente)
            try {
                const newAccessToken = await refreshPromise;
                req.headers.Authorization = `Bearer ${newAccessToken}`;
                return req;
            } catch (error) {
                return Promise.reject(error);
            }
        }, (error) => Promise.reject(error));

        // ============================================================
        // 🔴 RESPONSE INTERCEPTOR (Captura 401 vindo do Back)
        // ============================================================
        instance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const { config, response } = error;
                
                // Ignora erros em rotas públicas
                if (isPublicPath(config?.url)) {
                    return Promise.reject(error);
                }

                // Se der 401 mesmo após nossa tentativa de refresh (ou token inválido/revogado)
                if (response?.status === 401) {
                    logoutUser();
                }
                
                return Promise.reject(error);
            }
        );

        return instance;
    }, [authTokens, setAuthTokens, logoutUser]);

    return api;
};

export default useAxios;