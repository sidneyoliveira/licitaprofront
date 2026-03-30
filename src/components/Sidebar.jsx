import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  UserCheck,
  Scale,
} from "lucide-react";

/* Seções de navegação */
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
      { to: "/usuarios", icon: Users, label: "Usuários" },
    ],
  },
];

const Sidebar = ({ isOpen, isMobile, onClose }) => {
  return (
    <>
      {/* Sidebar principal */}
      <aside
        className={`
          fixed z-30 top-0 left-0 h-full flex flex-col
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
            flex items-center h-16 px-4
            border-b border-slate-200/80 dark:border-slate-700/60
            ${isOpen ? "gap-3" : "justify-center"}
          `}
        >
          {/* Ícone L3 */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-blue to-blue-700 flex items-center justify-center shadow-md shadow-blue-500/30">
              <Scale size={18} className="text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-[#141c2e]" />
          </div>

          {isOpen && (
            <div className="overflow-hidden">
              <p className="text-[15px] font-bold tracking-tight text-slate-800 dark:text-white leading-none">
                LicitaPro
              </p>
              <p className="text-[10px] font-medium tracking-widest text-accent-blue dark:text-blue-400 mt-0.5 uppercase">
                L3 Solutions
              </p>
            </div>
          )}
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
