// src/context/AuthContext.js
import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { axiosPublic, axiosInstance } from '../api/config';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// util simples: extrai payload do JWT (para checar exp opcionalmente)
const decodeJwt = (token) => {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};
const isExpired = (access) => {
  const p = decodeJwt(access);
  if (!p?.exp) return false; // se não der pra ler, tentamos no servidor
  const now = Math.floor(Date.now() / 1000);
  // dá uma folga de 20s para evitar race em requisições longas
  return p.exp <= now + 20;
};

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem('authTokens')
      ? JSON.parse(localStorage.getItem('authTokens'))
      : null
  );
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const navigate = useNavigate();

  const persistTokens = useCallback((tokens) => {
    setAuthTokens(tokens);
    localStorage.setItem('authTokens', JSON.stringify(tokens));
  }, []);

  const clearSession = useCallback(() => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
  }, []);

  const fetchUserData = useCallback(async (accessToken) => {
    const res = await axiosPublic.get('/me/', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setUser(res.data);
    return res.data;
  }, []);

  const isProfileIncomplete = (userData) => {
    if (!userData) return true;
    const required = ['cpf', 'phone', 'data_nascimento'];
    return required.some((field) => !userData[field]);
  };

  // === REFRESH: envia exatamente { refresh: "<token>" } ===
  const refreshAccessToken = useCallback(async () => {
    const refresh = authTokens?.refresh;
    if (!refresh) throw new Error('No refresh token');

    const { data } = await axiosPublic.post('/token/refresh/', { refresh });
    // SimpleJWT retorna { access: "..." }
    const newTokens = { ...authTokens, access: data.access };
    persistTokens(newTokens);
    return newTokens.access;
  }, [authTokens, persistTokens]);

  // garante um access válido (tenta refresh se necessário/expirado)
  const ensureAccess = useCallback(async () => {
    if (!authTokens?.access) throw new Error('No access token');
    if (!isExpired(authTokens.access)) return authTokens.access;

    // expirou (ou quase): faz refresh
    const newAccess = await refreshAccessToken();
    return newAccess;
  }, [authTokens, refreshAccessToken]);

  // headers prontos para usar em requisições autenticadas
  const authorizedHeaders = useCallback(async () => {
    const access = await ensureAccess();
    return { Authorization: `Bearer ${access}` };
  }, [ensureAccess]);

  // === LOGINs ===
  const loginUser = useCallback(
    async (username, password) => {
      try {
        const response = await axiosPublic.post('/token/', { username, password });
        if (response.status === 200) {
          const data = response.data; // { access, refresh }
          persistTokens(data);

          const me = await fetchUserData(data.access);

          if (isProfileIncomplete(me)) navigate('/complete-profile');
          else navigate('/');
        }
      } catch (error) {
        console.error('Erro no login:', error);
        if (error.response?.data) {
          throw new Error(error.response.data.detail || 'Ocorreu um erro desconhecido.');
        }
        throw new Error('Não foi possível conectar ao servidor.');
      }
    },
    [fetchUserData, navigate, persistTokens]
  );

  const loginWithGoogle = useCallback(
    async (googleCredential) => {
      try {
        const response = await axiosPublic.post('/google/', { token: googleCredential });
        const data = response.data; // { access, refresh }
        persistTokens(data);

        const me = await fetchUserData(data.access);

        if (isProfileIncomplete(me)) navigate('/complete-profile');
        else navigate('/');
      } catch (error) {
        console.error('Erro Google Login →', error);
        if (error.response?.data?.detail) throw new Error(error.response.data.detail);
        throw new Error('Erro ao autenticar com Google.');
      }
    },
    [fetchUserData, navigate, persistTokens]
  );

  const logoutUser = useCallback(() => {
    clearSession();
    navigate('/login');
  }, [navigate, clearSession]);

  // === BOOT: tenta /me; se falhar por expiração, faz refresh e re-tenta ===
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        if (!authTokens) {
          setUser(null);
          return;
        }
        let access = authTokens.access;

        // refresh proativo se estiver expirado
        if (isExpired(access)) {
          try {
            access = await refreshAccessToken();
          } catch {
            throw new Error('Refresh failed');
          }
        }

        await fetchUserData(access);
      } catch (e) {
        console.warn('Sessão inválida/expirada no boot, efetuando logout.');
        clearSession();
        navigate('/login');
      } finally {
        if (isMounted) setInitializing(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [authTokens, fetchUserData, refreshAccessToken, clearSession, navigate]);

  const contextData = useMemo(
    () => ({
      initializing,
      user,
      setUser,
      authTokens,
      setAuthTokens: persistTokens, // garante persistência
      loginUser,
      loginWithGoogle,
      logoutUser,
      // helpers novos:
      ensureAccess,
      authorizedHeaders,
      refreshAccessToken,
    }),
    [
      initializing,
      user,
      authTokens,
      persistTokens,
      loginUser,
      loginWithGoogle,
      logoutUser,
      ensureAccess,
      authorizedHeaders,
      refreshAccessToken,
    ]
  );

  return <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>;
};

export default AuthContext;
