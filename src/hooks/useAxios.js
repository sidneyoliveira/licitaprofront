import axios from 'axios';
import { useContext, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import AuthContext from '../context/AuthContext';

// Importa a instância base para obter a URL, garantindo consistência
import axiosInstance from '../api/AxiosInstance';
const baseURL = axiosInstance.defaults.baseURL;

const useAxios = () => {
    const { authTokens, setUser, setAuthTokens, logoutUser } = useContext(AuthContext);

    const api = useMemo(() => {
        const instance = axios.create({
            baseURL,
            headers: { Authorization: `Bearer ${authTokens?.access}` }
        });

        // Este é o "carteiro automático" que interceta todos os pedidos
        instance.interceptors.request.use(async req => {
            if (!authTokens) {
                return req;
            }

            const user = jwtDecode(authTokens.access);
            const isExpired = Date.now() >= user.exp * 1000;

            if (!isExpired) return req;

            // Se o token estiver expirado, usamos uma chamada axios direta (a "chave-mestra")
            // que não passa por este intercetor, quebrando o loop.
            try {
                const response = await axios.post(`${baseURL}/api/token/refresh/`, {
                    refresh: authTokens.refresh
                });

                localStorage.setItem('authTokens', JSON.stringify(response.data));
                setAuthTokens(response.data);
                setUser(jwtDecode(response.data.access));
                
                // Atualiza o cabeçalho da requisição original com o novo token
                req.headers.Authorization = `Bearer ${response.data.access}`;
                return req;

            } catch (error) {
                // Se a renovação falhar (ex: refresh token também expirou), faz logout.
                logoutUser();
                return Promise.reject(error);
            }
        });

        return instance;
    }, [authTokens, setUser, setAuthTokens, logoutUser]);

    return api;
};

export default useAxios;

