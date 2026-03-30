import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, Users, Building2, UserCheck } from "lucide-react";

const Sidebar = ({ isOpen, isMobile, onClose }) => {
  const navItem =
    "flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg font-medium transition-colors";

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
        className={`fixed z-30 top-0 left-0 h-full bg-white dark:bg-dark-bg-secondary border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out
          ${isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
          ${isMobile ? "w-64" : isOpen ? "w-64" : "w-20"} flex flex-col`}
      >
        {/* Logo e título */}
        <div className="flex items-center justify-center px-4 py-4 mt-3">
          <div
            className="w-10 h-10 rounded-lg bg-accent-blue flex items-center justify-center text-lg font-extrabold text-white"
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
                  ? "bg-accent-blue/10 text-accent-blue dark:bg-accent-blue/20 dark:text-blue-400"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
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
                  ? "bg-accent-blue/10 text-accent-blue dark:bg-accent-blue/20 dark:text-blue-400"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
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
                  ? "bg-accent-blue/10 text-accent-blue dark:bg-accent-blue/20 dark:text-blue-400"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
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
                  ? "bg-accent-blue/10 text-accent-blue dark:bg-accent-blue/20 dark:text-blue-400"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
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
                  ? "bg-accent-blue/10 text-accent-blue dark:bg-accent-blue/20 dark:text-blue-400"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`
            }
          >
            <Users size={18} />
            {isOpen && "Usuários"}
          </NavLink>
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500">
          {isOpen && "© 2025 L3 Solutions"}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
