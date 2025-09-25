import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { ChartPieIcon, ServerStackIcon, ArchiveBoxIcon, Cog6ToothIcon, UserIcon } from '@heroicons/react/24/outline';

const StyledNavLink = ({ to, icon, children }) => (
  <NavLink
    to={to}
    end // Garante que a rota "/" só fique ativa na página inicial exata
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
  const { user, logoutUser } = useContext(AuthContext);

  return (
    <aside className="w-64 flex-shrink-0 bg-light-bg-secondary dark:bg-dark-bg-secondary border-r border-light-border dark:border-dark-border flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-light-border dark:border-dark-border">
        <h1 className="text-xl font-bold text-accent-blue">LICITA.PRO</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <StyledNavLink to="/" icon={ChartPieIcon}>Início</StyledNavLink>
        <StyledNavLink to="/processos" icon={ServerStackIcon}>Processos</StyledNavLink>
        <StyledNavLink to="/cadastros" icon={ArchiveBoxIcon}>Cadastros</StyledNavLink>
        <StyledNavLink to="/fornecedores" icon={ArchiveBoxIcon}>Fornecedores</StyledNavLink>
        <StyledNavLink to="/configuracoes" icon={Cog6ToothIcon}>Configurações</StyledNavLink>
      </nav>
      <div className="p-4 border-t border-light-border dark:border-dark-border">
        <div className="p-3 rounded-lg bg-light-bg-primary dark:bg-dark-bg-primary">
            <p className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary">{user.username}</p>
            <Link to="/perfil" className="text-xs text-accent-blue hover:underline">Ver Perfil</Link>
            <button onClick={logoutUser} className="w-full text-left text-sm mt-2 text-red-500 hover:underline">
              Sair
            </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;