// frontend/src/components/Sidebar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChartPieIcon, ServerStackIcon, ArchiveBoxIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const StyledNavLink = ({ to, icon, children, end = false }) => (
    <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                isActive
                    ? 'bg-accent-blue text-white shadow-md'
                    : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-border dark:hover:bg-gradient-to-r dark:from-dark-bg-secondary dark:to-transparent'
            }`
        }
    >
        <span className="flex-shrink-0 w-5 h-5 mr-3">{React.createElement(icon)}</span>
        <span className="opacity-100">{children}</span>
    </NavLink>
);

const Sidebar = () => {
    return (
        <aside className="w-64 flex-shrink-0 bg-light-bg-secondary dark:bg-dark-bg-secondary border-r border-light-border dark:border-dark-border flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-light-border dark:border-dark-border">
                <h1 className="text-xl font-bold text-accent-blue tracking-wider">LICITA.PRO</h1>
            </div>

            {/* Navegação Principal */}
            <nav className="flex-1 py-4 px-3 space-y-2">
                <StyledNavLink to="/" icon={ChartPieIcon} end>Início</StyledNavLink>
                <StyledNavLink to="/processos" icon={ServerStackIcon}>Processos</StyledNavLink>
                <StyledNavLink to="/cadastros" icon={ArchiveBoxIcon}>Cadastros</StyledNavLink>
                {/* Adicione outras páginas principais aqui, como Fornecedores, se desejar */}
            </nav>

            {/* Rodapé da Barra Lateral com Configurações */}
            <div className="py-4 px-3 border-t border-light-border dark:border-dark-border">
                <StyledNavLink to="/configuracoes" icon={Cog6ToothIcon}>Configurações</StyledNavLink>
            </div>
        </aside>
    );
};

export default Sidebar;