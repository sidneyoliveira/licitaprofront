// src/components/Header.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext'; // Importe o hook do tema
import { SunIcon, MoonIcon, UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

const Header = () => {
  const { isDark, toggleTheme } = useTheme(); // Use o contexto do tema

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-light-bg-secondary dark:bg-dark-bg-secondary border-b border-light-border dark:border-dark-border flex-shrink-0">

      {/* BOTÃO DE TEMA - CANTO SUPERIOR ESQUERDO */}
      <div className="flex items-center">
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border transition-colors"
        >
          {isDark ? 
            <SunIcon className="w-6 h-6 text-yellow-400" /> : 
            <MoonIcon className="w-6 h-6 text-gray-700" />
          }
        </button>
      </div>

      {/* PARTE DIREITA DO CABEÇALHO */}
      <div className="flex items-center space-x-4">
        {/* ... o botão da conta continua aqui ... */}
        <button className="flex items-center px-3 py-2 rounded-lg border border-light-border dark:border-dark-border">
          <UserCircleIcon className="w-6 h-6 text-light-text-secondary dark:text-dark-text-secondary mr-2" />
          <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">Account</span>
          <ChevronDownIcon className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary ml-2" />
        </button>
      </div>
    </header>
  );
};

export default Header;