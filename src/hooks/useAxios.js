import axios from 'axios';
import { useContext, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import AuthContext from '../context/AuthContext';

const BASE_URL = 'http://l3solution.net.br/api/';
const axiosPublic = axios.create({ baseURL: BASE_URL });

let refreshPromise = null;

const isPublicPath = (url = '') => {
  const u = url.toLowerCase();
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
        if (!access) return req;

        try {
          const payload = jwtDecode(access);
          const isExpired = Date.now() >= payload.exp * 1000;

          if (!isExpired) {
            req.headers.Authorization = `Bearer ${access}`;
            return req;
          }
        } catch {
          // se não decodificar, tenta refresh
        }

        if (!refreshPromise) {
          refreshPromise = axiosPublic
            .post('/token/refresh/', { refresh: authTokens?.refresh })
            .then((res) => {
              const newTokens = res.data;
              localStorage.setItem('authTokens', JSON.stringify(newTokens));
              setAuthTokens(newTokens);
              return newTokens;
            })
            .catch((err) => {
              logoutUser();
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
