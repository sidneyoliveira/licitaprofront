import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../api/AxiosInstance';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem('authTokens')
      ? JSON.parse(localStorage.getItem('authTokens'))
      : null
  );

  const [user, setUser] = useState(() =>
    localStorage.getItem('authTokens')
      ? jwtDecode(JSON.parse(localStorage.getItem('authTokens')).access)
      : null
  );

  const navigate = useNavigate();

  // ✅ Verifica se perfil está incompleto para obrigar atualização
  const isProfileIncomplete = (decodedUser) => {
    if (!decodedUser) return true;
    const required = ["cpf", "phone", "data_nascimento"];
    return required.some(field => !decodedUser[field]);
  };


  // ✅ Login padrão
  const loginUser = useCallback(async (username, password) => {
    try {
      const response = await axiosInstance.post('/token/', { username, password });

      if (response.status === 200) {
        const data = response.data;
        localStorage.setItem('authTokens', JSON.stringify(data));

        const decoded = jwtDecode(data.access);
        setAuthTokens(data);
        setUser(decoded);

        if (isProfileIncomplete(decoded)) {
          navigate("/perfil?pendente=true");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data.detail || 'Ocorreu um erro desconhecido.');
      }
      throw new Error('Não foi possível conectar ao servidor.');
    }
  }, [navigate]);


  // ✅ Login Google
  const loginWithGoogle = useCallback(async (googleCredential) => {
    try {
      const response = await axiosInstance.post('/google/', { token: googleCredential });
      const data = response.data;

      localStorage.setItem('authTokens', JSON.stringify(data));

      const decoded = jwtDecode(data.access);
      setAuthTokens(data);
      setUser(decoded);

      if (isProfileIncomplete(decoded)) {
        navigate("/perfil?pendente=true");
      } else {
        navigate("/");
      }

    } catch (error) {
      console.error('Erro Google Login →', error);
      throw new Error('Erro ao autenticar com Google.');
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
    loginWithGoogle,
    logoutUser
  }), [user, authTokens, loginUser, loginWithGoogle, logoutUser]);


  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
