import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  UserCheck,
  Scale,
  UserCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ isOpen, isMobile, onClose }) => {
  const { user } = useAuth();
  const isAdmin = user?.is_staff || user?.is_superuser;

  /* Seções de navegação — montadas dinamicamente */
  const NAV_SECTIONS = [
    {
      label: "PRINCIPAL",
      items: [
        { to: "/", icon: LayoutDashboard, label: "Início" },
        { to: "/processos", icon: FileText, label: "Processos" },
      ],
    },
    {
      label: "CADASTROS",
      items: [
        { to: "/entidades", icon: Building2, label: "Entidades" },
        { to: "/fornecedores", icon: UserCheck, label: "Fornecedores" },
        // Usuários aparece SOMENTE para admin/staff
        ...(isAdmin ? [{ to: "/usuarios", icon: Users, label: "Usuários" }] : []),
      ],
    },
    {
      label: "CONTA",
      items: [
        { to: "/perfil", icon: UserCircle, label: "Meu Perfil" },
      ],
    },
  ];
  return (
    <>
      {/* Sidebar principal */}
      <aside
        className={`
          fixed z-50 top-0 left-0 h-full flex flex-col
          bg-white dark:bg-[#141c2e]
          border-r border-slate-200/80 dark:border-slate-700/60
          transform transition-all duration-300 ease-in-out
          ${isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
          ${isMobile ? "w-64" : isOpen ? "w-64" : "w-20"}
        `}
      >
        {/* ── Logo ── */}
        <div
          className={`
            flex items-center h-16 px-5
            border-b border-slate-200/80 dark:border-slate-700/60
            ${isOpen ? "" : "justify-center"}
          `}
        >
          <div className="flex items-center justify-center select-none">
            <div className="w-10 h-10 flex items-center text-3xl font-extrabold text-gray-800 dark:text-white leading-none">
              L3
            </div>
            {isOpen && (
              <h1 className="text-3xl font-regular tracking-tight text-[#757575] dark:text-[#d6d6d6]">
                SOLUTIONS
              </h1>
            )}
          </div>
        </div>

        {/* ── Navegação ── */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-2">
              {/* Label da seção */}
              {isOpen && (
                <p className="px-5 mb-1 text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 select-none">
                  {section.label}
                </p>
              )}
              {!isOpen && (
                <div className="mx-3 my-1 border-t border-slate-200 dark:border-slate-700/60" />
              )}

              <ul className="space-y-0.5 px-2">
                {section.items.map(({ to, icon: Icon, label }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={to === "/"}
                      className={({ isActive }) =>
                        `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                        ${
                          isActive
                            ? "bg-accent-blue text-white shadow-sm shadow-blue-500/20"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100"
                        }
                        ${!isOpen ? "justify-center" : ""}
                        `
                      }
                      title={!isOpen ? label : undefined}
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={18}
                            className={`flex-shrink-0 ${isActive ? "text-white" : ""}`}
                          />
                          {isOpen && (
                            <span className="truncate">{label}</span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Rodapé ── */}
        <div
          className={`
            py-3 px-4 border-t border-slate-200/80 dark:border-slate-700/60
            ${isOpen ? "" : "flex justify-center"}
          `}
        >
          {isOpen ? (
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                L3 Solutions
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                v2.0 · © {new Date().getFullYear()}
              </p>
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-accent-blue/10 dark:bg-accent-blue/20 flex items-center justify-center">
              <Scale size={14} className="text-accent-blue dark:text-blue-400" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
