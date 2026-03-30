import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, Users, Building2, Settings, UserCheck } from "lucide-react";

const Sidebar = ({ isOpen, isMobile, onClose }) => {
  const navItem =
    "flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl font-medium transition-colors";

  return (
    <>
      {/* Overlay escuro para mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar principal */}
      <aside
        className={`fixed z-30 top-0 left-0 h-full bg-white/85 dark:bg-slate-900/80 backdrop-blur-xl border-r border-white/60 dark:border-white/10 transform transition-transform duration-300 ease-in-out
          ${isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
          ${isMobile ? "w-64" : isOpen ? "w-64" : "w-20"} flex flex-col`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-accent-blue/20 to-transparent" />
        {/* Logo e título */}
        <div className="flex items-center justify-center px-4 py-4 mt-3 relative z-10">
          <div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-blue-500 flex items-center justify-center text-lg font-extrabold text-white shadow-lg shadow-blue-900/25"
          >
            L3
          </div>
          {isOpen && (
            <h1 className="ml-2 text-2xl font-light tracking-tight text-slate-600 dark:text-slate-200">
              SOLUTIONS
            </h1>
          )}
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${navItem} ${
                isActive
                  ? "bg-gradient-to-r from-accent-blue/15 to-cyan-400/10 text-accent-blue dark:text-white dark:from-accent-blue/35 dark:to-cyan-400/10"
                  : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-slate-800/75"
              }`
            }
          >
            <LayoutDashboard size={18} />
            {isOpen && "Início"}
          </NavLink>

          <NavLink
            to="/processos"
            className={({ isActive }) =>
              `${navItem} ${
                isActive
                  ? "bg-gradient-to-r from-accent-blue/15 to-cyan-400/10 text-accent-blue dark:text-white dark:from-accent-blue/35 dark:to-cyan-400/10"
                  : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-slate-800/75"
              }`
            }
          >
            <FileText size={18} />
            {isOpen && "Processos"}
          </NavLink>

          <NavLink
            to="/entidades"
            className={({ isActive }) =>
              `${navItem} ${
                isActive
                  ? "bg-gradient-to-r from-accent-blue/15 to-cyan-400/10 text-accent-blue dark:text-white dark:from-accent-blue/35 dark:to-cyan-400/10"
                  : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-slate-800/75"
              }`
            }
          >
            <Building2 size={18} />
            {isOpen && "Entidades"}
          </NavLink>

          <NavLink
            to="/fornecedores"
            className={({ isActive }) =>
              `${navItem} ${
                isActive
                  ? "bg-gradient-to-r from-accent-blue/15 to-cyan-400/10 text-accent-blue dark:text-white dark:from-accent-blue/35 dark:to-cyan-400/10"
                  : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-slate-800/75"
              }`
            }
          >
            <UserCheck size={18} />
            {isOpen && "Fornecedores"}
          </NavLink>

          <NavLink
            to="/usuarios"
            className={({ isActive }) =>
              `${navItem} ${
                isActive
                  ? "bg-gradient-to-r from-accent-blue/15 to-cyan-400/10 text-accent-blue dark:text-white dark:from-accent-blue/35 dark:to-cyan-400/10"
                  : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-slate-800/75"
              }`
            }
          >
            <Users size={18} />
            {isOpen && "Usuários"}
          </NavLink>

          <NavLink
            to="/configuracoes"
            className={({ isActive }) =>
              `${navItem} ${
                isActive
                  ? "bg-gradient-to-r from-accent-blue/15 to-cyan-400/10 text-accent-blue dark:text-white dark:from-accent-blue/35 dark:to-cyan-400/10"
                  : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-slate-800/75"
              }`
            }
          >
            <Settings size={18} />
            {isOpen && "Configurações"}
          </NavLink>
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="p-3 border-t border-white/60 dark:border-white/10 text-xs text-gray-500 dark:text-gray-400 relative z-10">
          {isOpen && "© 2025 L3 Solutions"}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
