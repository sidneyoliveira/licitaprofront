import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import LogoBranco from "../assets/img/logo_branco.png";
import LogoLL from "../assets/img/logo_ll.png";

// ======= COMPONENTE LOGIN =======
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser, loginWithGoogle, googleClientId } = useContext(AuthContext);
  const { showToast } = useToast();

  // ======= LOGIN NORMAL =======
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loginUser(username, password);
    } catch {
      showToast("Credenciais inválidas ou servidor indisponível.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ======= LOGIN COM GOOGLE =======
  const handleGoogleCallback = async (response) => {
    if (!response?.credential) {
      showToast("Falha ao obter credencial Google", "error");
      return;
    }
    try {
      await loginWithGoogle(response.credential);
    } catch {
      showToast("Erro ao autenticar com Google.", "error");
    }
  };

  // ======= INICIALIZA O GOOGLE SIGN-IN =======
  useEffect(() => {
    let intervalId;

    const checkGoogleLibrary = () => {
      // 1. Verifica se a biblioteca já carregou
      if (window.google?.accounts?.id) {
        
        clearInterval(intervalId); // Para o loop imediatamente

        const buttonDiv = document.getElementById("googleSignInDiv");
        
        if (buttonDiv) {
          try {
            // LIMPEZA: Remove qualquer botão antigo antes de criar um novo
            buttonDiv.innerHTML = ''; 

            // Inicializa com as configurações
            window.google.accounts.id.initialize({
              client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID, 
              callback: handleGoogleCallback,
              ux_mode: "popup",
              auto_select: false,
              use_fedcm_for_prompt: false,
            });

            // Ajusta o estilo e Renderiza
            buttonDiv.style.display = "flex";
            buttonDiv.style.justifyContent = "center";
            
            window.google.accounts.id.renderButton(buttonDiv, {
              theme: "outline",
              size: "large",
              shape: "pill",
              width: 400,
            });

          } catch (error) {
            console.error("Erro ao renderizar botão Google:", error);
          }
        }
        return true; 
      }
      return false;
    };

    // 2. Injeta o script apenas se não existir
    const scriptUrl = "https://accounts.google.com/gsi/client";
    if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
      const script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    // 3. Tenta rodar a primeira vez; se falhar, inicia o loop
    if (!checkGoogleLibrary()) {
      intervalId = setInterval(checkGoogleLibrary, 100);
    }

    // 4. Cleanup: Garante que o intervalo pare se sair da tela
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [handleGoogleCallback]);
  
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* ==== COLUNA ESQUERDA ==== */}
      <div className="flex flex-col justify-center mx-10 md:mx-36 px-6 lg:px-16 w-full md:w-[50%] max-w-[600px]">
        <h1 className="text-3xl font-bold text-accent-blue mb-2">
          Acesse sua conta
        </h1>
        <p className="text-gray-600 mb-8">
          Faça login para gerenciar seus processos licitatórios.
        </p>

        {/* ====== GOOGLE LOGIN ====== */}
        <div
          id="googleSignInDiv"
          className="flex justify-center w-full"
          style={{ minHeight: "48px" }}
        ></div>

        <div className="my-6 flex items-center gap-2">
          <span className="flex-grow border-t border-gray-300"></span>
          <span className="text-gray-400 text-sm">ou</span>
          <span className="flex-grow border-t border-gray-300"></span>
        </div>

        {/* ====== LOGIN NORMAL ====== */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Usuário ou E-mail
            </label>
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
            <label className="text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              className="w-full mt-1 px-3 py-3 border rounded-xl focus:ring-2 focus:ring-accent-blue focus:outline-none"
              placeholder="Informe sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="text-xs font-medium text-accent-blue hover:underline mt-1"
            >
              Esqueceu a senha?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent-blue text-white py-3 rounded-xl font-semibold hover:bg-[#0043c2] transition disabled:opacity-50"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* ====== CADASTRO ====== */}
        <p className="text-sm text-gray-700 mt-6 text-center">
          Não tem uma conta?
          <Link
            to="/register"
            className="font-semibold text-accent-blue hover:underline"
          >
            &nbsp;Cadastre-se
          </Link>
        </p>
      </div>

      {/* ==== COLUNA DIREITA ==== */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-b from-accent-blue to-[#0d3977] text-white">
        <div className="text-center px-6">
          <img
            src={LogoBranco}
            alt="L3 Solutions Logo"
            className="w-52 mx-auto drop-shadow-xl"
          />

          <div className="flex items-center justify-center gap-2">
            <div className="text-5xl font-extrabold text-white">L3</div>
            <h1 className="text-5xl font-normal tracking-tight text-gray-200">
              SOLUTIONS
            </h1>
          </div>

          <p className="mt-4 text-white/90 leading-relaxed">
            Gestão de Processos
          </p>

          <p className="mt-10 text-white/70 text-sm flex items-center justify-center gap-2">
            <a href="https://www.llassessoriaeservicos.com.br/"  target="_blank" className="inline-flex items-center gap-2">
              <img
                src={LogoLL}
                alt="L&L Acessoria e Serviços"
                className="h-10 object-contain"
                
              />
            </a>
            <span className="w-px h-4 bg-white/30" />
            <span>© {new Date().getFullYear()} L&L Assessoria e Serviços</span>

          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
