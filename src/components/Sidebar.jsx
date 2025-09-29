// frontend/src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    ChartPieIcon, 
    DocumentTextIcon, 
    ArchiveBoxIcon,
    BuildingOfficeIcon,
    UsersIcon,
    BellIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

const StyledNavLink = ({ to, icon, children, end = false }) => (
    <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive
                    ? 'bg-accent-blue text-white'
                    : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-bg-secondary'
            }`
        }
    >
        {React.createElement(icon, { className: "w-5 h-5 mr-3" })}
        {children}
    </NavLink>
);

const Sidebar = () => {
    return (
        <aside className="w-64 flex-shrink-0 bg-light-bg-secondary dark:bg-dark-bg-secondary border-r border-light-border dark:border-dark-border flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-light-border dark:border-dark-border">
                <h1 className="text-xl font-bold text-accent-blue">LICITA.PRO</h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <StyledNavLink to="/" icon={ChartPieIcon} end>Início</StyledNavLink>
                <StyledNavLink to="/processos" icon={DocumentTextIcon}>Processos</StyledNavLink>
                <StyledNavLink to="/cadastros" icon={ArchiveBoxIcon}>Cadastros</StyledNavLink>
                <StyledNavLink to="/fornecedores" icon={BuildingOfficeIcon}>Fornecedores</StyledNavLink>
                <StyledNavLink to="/usuarios" icon={UsersIcon}>Usuários</StyledNavLink>
                <StyledNavLink to="/notificacoes" icon={BellIcon}>Notificações</StyledNavLink>
            </nav>

            <div className="p-4 border-t border-light-border dark:border-dark-border">
                <StyledNavLink to="/configuracoes" icon={Cog6ToothIcon}>Configurações</StyledNavLink>
            </div>
        </aside>
    );
};

export default Sidebar;