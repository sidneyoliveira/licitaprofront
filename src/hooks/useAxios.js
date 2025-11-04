// src/hooks/useAxios.js
import axios from 'axios';
import { useContext, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import AuthContext from '../context/AuthContext';

const BASE_URL = 'http://l3solution.net.br/api/';
const axiosPublic = axios.create({ baseURL: BASE_URL });

let refreshPromise = null;

const isPublicPath = (url = '') => {
  const u = (url || '').toLowerCase();
  // considere também urls absolutas
  return u.includes('/token/') || u.includes('/google/');
};

const useAxios = () => {
  const { authTokens, setAuthTokens, logoutUser } = useContext(AuthContext);

  const api = useMemo(() => {
    const instance = axios.create({ baseURL: BASE_URL });

    instance.interceptors.request.use(
      async (req) => {
        if (isPublicPath(req.url)) return req;

        const access = authTokens?.access;
        if (!access) return req; // request pública

        // usa o access atual se não expirou
        try {
          const payload = jwtDecode(access);
          const isExpired = Date.now() >= payload.exp * 1000;
          if (!isExpired) {
            req.headers.Authorization = `Bearer ${access}`;
            return req;
          }
        } catch {
          // se não der pra decodificar, cai pro refresh
        }

        // refresh controlado (evita múltiplos POST /token/refresh/)
        if (!refreshPromise) {
          refreshPromise = axiosPublic
            .post('/token/refresh/', { refresh: authTokens?.refresh })
            .then((res) => {
              const newAccess = res?.data?.access;
              if (!newAccess) throw new Error('Refresh sem access');

              // ✅ mescla access novo com o refresh antigo (não perca o refresh!)
              const merged = { ...authTokens, access: newAccess };
              localStorage.setItem('authTokens', JSON.stringify(merged));
              setAuthTokens(merged);
              return merged;
            })
            .catch((err) => {
              try { logoutUser(); } catch {}
              throw err;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const newTokens = await refreshPromise;
        req.headers.Authorization = `Bearer ${newTokens.access}`;
        return req;
      },
      (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const { config, response } = error;
        const status = response?.status;

        if (isPublicPath(config?.url)) {
          return Promise.reject(error);
        }

        // se chegou 401 aqui, o refresh já falhou no request → encerra sessão
        if (status === 401) {
          try { logoutUser(); } catch {}
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [authTokens, setAuthTokens, logoutUser]);

  return api;
};

export default useAxios;
