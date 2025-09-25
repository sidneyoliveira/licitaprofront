// src/pages/Login.js
import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext'; // Importe o contexto
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { loginUser } = useContext(AuthContext); // Use a função de login do contexto

  const handleSubmit = async (e) => {
    e.preventDefault();
    loginUser(username, password);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="username">Usuário</label>
            <input
              className="w-full px-3 py-2 border rounded"
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">Senha</label>
            <input
              className="w-full px-3 py-2 border rounded"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            Entrar
          </button>
        </form>
        <div className="text-center mt-6">
                    <p className="text-gray-600">
                        Não tem uma conta?{' '}
                        <Link to="/register" className="text-blue-500 hover:underline">
                            Cadastre-se
                        </Link>
                    </p>
                </div>
      </div>
    </div>
  );
};

export default Login;