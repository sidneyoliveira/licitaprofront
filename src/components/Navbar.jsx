import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Bell, User } from "lucide-react";

/**
 * Navbar principal (novo designer L3 SOLUTIONS)
 * - Mantém comunicação e links dinâmicos
 * - Usa tokens de cor do tema (accent-blue)
 * - Responsivo e leve, pronto pra integrar com o Layout e Sidebar
 */

const Navbar = ({ onToggleSidebar }) => {
  const location = useLocation();

  return (
    <header
      className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md 
                 border-b border-gray-200 shadow-sm dark:bg-[#1E293B]/90 dark:border-gray-700"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Seção esquerda: logo e título */}
        <div className="flex items-center gap-3">
          {/* Botão hamburguer (mobile) */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>

          {/* Logo */}
          <div
            className="w-11 h-11 flex items-center justify-center rounded-md shadow font-bold text-white text-lg bg-gradient-to-br from-accent-blue to-accent-blue-hover"
          >
            L3
          </div>

          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-gray-800 dark:text-white">
              L3 SOLUTIONS
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {location.pathname === "/" ? "Início" : "Processos"}
            </span>
          </div>
        </div>

        {/* Seção direita: ícones e usuário */}
        <nav className="flex items-center gap-3">
          <Link
            to="/notificacoes"
            className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Bell className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            {/* Exemplo de indicador de notificação */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-blue" />
          </Link>

          <Link
            to="/usuarios"
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <User className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </Link>

          <Link
            to="/configuracoes"
            className="px-3 py-2 text-sm font-medium rounded-md text-white shadow-sm bg-gradient-to-br from-accent-blue to-accent-blue-hover"
          >
            Configurações
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
