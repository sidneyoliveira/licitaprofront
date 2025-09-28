import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext'; // Importe o useToast

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser } = useContext(AuthContext);
  const { showToast } = useToast(); // Use o hook de notificações

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loginUser(username, password);
      // O redirecionamento é tratado dentro do loginUser em caso de sucesso
    } catch (error) {
      // Apanha o erro lançado pelo loginUser e exibe a sua mensagem
      // A mensagem padrão do Django para login falhado é "No active account found with the given credentials"
      // Podemos traduzi-la para algo mais amigável.
      let friendlyMessage = 'Usuário ou senha inválidos. Por favor, verifique os seus dados.';
      
      // Se a mensagem de erro original for sobre rede, usamos outra mensagem.
      if (error.message.includes('Network Error') || error.message.includes('conectar')) {
          friendlyMessage = 'Não foi possível conectar ao servidor. Tente novamente mais tarde.';
      }

      showToast(friendlyMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-dark-bg-primary">
      <div className="p-8 bg-white dark:bg-dark-bg-secondary rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6 text-light-text-primary dark:text-dark-text-primary">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary" htmlFor="username">Usuário</label>
            <input
              className="w-full mt-1 px-3 py-2 border rounded-md bg-light-bg-primary dark:bg-dark-bg-primary"
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary" htmlFor="password">Senha</label>
            <input
              className="w-full mt-1 px-3 py-2 border rounded-md bg-light-bg-primary dark:bg-dark-bg-primary"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-accent-blue text-white py-2 rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity">
            {isLoading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>
        <div className="text-center mt-6">
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Não tem uma conta?{' '}
                <Link to="/register" className="font-medium text-accent-blue hover:underline">
                    Cadastre-se
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
