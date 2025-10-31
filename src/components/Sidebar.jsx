import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, Users, Building2, Settings, UserCheck } from "lucide-react";

const Sidebar = ({ isOpen, isMobile, onClose }) => {
  const navItem =
    "flex items-center gap-3 px-4 py-2.5 text-md  rounded-lg font-medium transition-colors";

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
        className={`fixed z-50 top-0 left-0 h-full bg-white dark:bg-dark-bg-secondary transform transition-transform duration-300 ease-in-out
          ${isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
          ${isMobile ? "w-64" : isOpen ? "w-64" : "w-20"} flex flex-col`}
      >
        {/* Logo e título */}
        <div className="flex items-center justify-center px-4 py-4 mt-3">
          <div
            className="w-10 h-10 flex items-center text-3xl font-extrabold text-gray-800 dark:text-white "
          >
            L3
          </div>
          {isOpen && (
            <h1 className="text-3xl font-regular tracking-tight text-[#757575] dark:text-[#d6d6d6]">
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
                  ? "bg-[#E8F4FF] text-[#1789D2] dark:text-gray-300  dark:bg-[#0F294A] border border-[#bcd2e0] dark:border-[#1c4274]"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
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
                  ? "bg-[#E8F4FF] text-[#1789D2] dark:bg-[#0F294A]"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
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
                  ? "bg-[#E8F4FF] text-[#1789D2] dark:bg-[#0F294A]"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
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
                  ? "bg-[#E8F4FF] text-[#1789D2] dark:bg-[#0F294A]"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
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
                  ? "bg-[#E8F4FF] text-[#1789D2] dark:bg-[#0F294A]"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
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
                  ? "bg-[#E8F4FF] text-[#1789D2] dark:bg-[#0F294A]"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`
            }
          >
            <Settings size={18} />
            {isOpen && "Configurações"}
          </NavLink>
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          {isOpen && "© 2025 L3 Solutions"}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
