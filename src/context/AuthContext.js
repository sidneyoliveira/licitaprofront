import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import { useNavigate } from 'react-router-dom';
import axiosPublic from '../api/axiosPublic';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem('authTokens')
      ? JSON.parse(localStorage.getItem('authTokens'))
      : null
  );
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const navigate = useNavigate();

  const fetchUserData = useCallback(async (token) => {
    const res = await axiosPublic.get('/me/', {
      headers: { Authorization: `Bearer ${token.access}` },
    });
    setUser(res.data);
    return res.data;
  }, []);

  const isProfileIncomplete = (userData) => {
    if (!userData) return true;
    const required = ['cpf', 'phone', 'data_nascimento'];
    return required.some((field) => !userData[field]);
  };

  const loginUser = useCallback(
    async (username, password) => {
      try {
        const response = await axiosPublic.post('/token/', { username, password });
        if (response.status === 200) {
          const data = response.data;
          localStorage.setItem('authTokens', JSON.stringify(data));
          setAuthTokens(data);

          const me = await fetchUserData(data);

          if (isProfileIncomplete(me)) {
            navigate('/complete-profile');
          } else {
            navigate('/');
          }
        }
      } catch (error) {
        console.error('Erro no login:', error);
        if (error.response?.data) {
          throw new Error(error.response.data.detail || 'Ocorreu um erro desconhecido.');
        }
        throw new Error('Não foi possível conectar ao servidor.');
      }
    },
    [fetchUserData, navigate]
  );

  const loginWithGoogle = useCallback(
    async (googleCredential) => {
      try {
        const response = await axiosPublic.post('/google/', { token: googleCredential });
        const data = response.data;
        localStorage.setItem('authTokens', JSON.stringify(data));
        setAuthTokens(data);

        const me = await fetchUserData(data);

        if (isProfileIncomplete(me)) {
          navigate('/complete-profile');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Erro Google Login →', error);
        if (error.response?.data?.detail) throw new Error(error.response.data.detail);
        throw new Error('Erro ao autenticar com Google.');
      }
    },
    [fetchUserData, navigate]
  );

  const logoutUser = useCallback(() => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        if (authTokens) {
          await fetchUserData(authTokens);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.warn('Falha ao validar sessão no boot, realizando logout.');
        logoutUser();
      } finally {
        if (isMounted) setInitializing(false);
      }
    })();

    return () => { isMounted = false; };
  }, [authTokens, fetchUserData, logoutUser]);

  const contextData = useMemo(
    () => ({
      initializing,
      user,
      setUser,
      authTokens,
      setAuthTokens,
      loginUser,
      loginWithGoogle,
      logoutUser,
    }),
    [initializing, user, authTokens, loginUser, loginWithGoogle, logoutUser]
  );

  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
