import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FcGoogle } from "react-icons/fc";
import LogoBranco from "../assets/img/logo_branco.png";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser, loginWithGoogle } = useContext(AuthContext);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await loginUser(username, password);
    } catch (error) {
      showToast('Credenciais inválidas ou servidor indisponível.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      showToast('Erro ao autenticar com Google.', 'error');
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">

      {/* LADO ESQUERDO - FORM */}
      <div className="flex flex-col justify-center px-10 lg:px-16 w-full md:w-[50%] max-w-[720px] mx-auto">

        <h1 className="text-3xl font-bold text-accent-blue mb-3">Acesse sua conta</h1>
        <p className="text-gray-600 mb-8">Faça login para gerenciar seus processos licitatórios.</p>

        <button
          type="button"
          onClick={handleGoogleAuth}
          className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition text-gray-700 shadow-sm"
        >
          <FcGoogle size={20} />
          Entrar com Google
        </button>

        <div className="my-6 flex items-center gap-2">
          <span className="flex-grow border-t border-gray-300"></span>
          <span className="text-gray-400 text-sm">ou</span>
          <span className="flex-grow border-t border-gray-300"></span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="text-sm font-medium text-gray-700">Usuário ou E-mail</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-accent-blue focus:outline-none"
              placeholder="Informe seu usuário ou e-mail"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">Senha</label>
              <button type="button" className="text-xs font-medium text-accent-blue hover:underline">
                Esqueceu a senha?
              </button>
            </div>
            <input
              type="password"
              className="w-full mt-1 px-3 py-3 border rounded-xl focus:ring-2 focus:ring-accent-blue focus:outline-none"
              placeholder="Informe sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent-blue text-white py-3 rounded-xl font-semibold hover:bg-accent-blue transition disabled:opacity-50"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-sm text-gray-700 mt-6 text-center">
          Não tem uma conta?
          <Link to="/register" className="font-semibold text-accent-blue hover:underline">
            &nbsp;Cadastre-se
          </Link>
        </p>
      </div>

      {/* LADO DIREITO - LOGO + FUNDO */}
      <div className="hidden md:flex flex-1 items-center justify-center text-white bg-gradient-to-b from-accent-blue to-[#0d3977]">
        <div className="text-center px-6">

          {/* LOGO */}
          <img
            src={LogoBranco}
            alt="L3 Solutions Logo"
            className="w-52 mx-auto drop-shadow-xl"
          />

          <div class="flex items-center justify-center gap-6 px-4 py-4 mt-3">
            <div class="w-10 h-10 flex items-center text-5xl font-extrabold text-white ">L3</div>
            <h1 class="text-5xl font-normal tracking-tight text-gray-200">SOLUTIONS</h1>
          </div>

          <p className="mt-4 text-white/90 leading-relaxed">
            Sistema de Gestão de<br/>
            Processos Licitatórios
          </p>

          <p className="mt-10 text-white/70 text-sm">
            © {new Date().getFullYear()} L3 Solutions
          </p>
        </div>
      </div>

    </div>
  );
};

export default Login;
