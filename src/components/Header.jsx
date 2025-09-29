// frontend/src/components/Header.jsx

import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // 1. Importar o hook do tema
import { BellIcon, UserCircleIcon, ChevronDownIcon, ArchiveBoxIcon, ArrowRightOnRectangleIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';

// Hook customizado para detetar cliques fora de um elemento (para fechar os dropdowns)
const useClickOutside = (ref, handler) => {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};

const Header = () => {
    const { user, logoutUser } = useContext(AuthContext);
    const { isDark, toggleTheme } = useTheme(); // 2. Usar o hook do tema

    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, text: 'Novo processo "Pregão Eletrônico 123/2025" foi adicionado.', read: false },
        { id: 2, text: 'A data de abertura do certame 012/2025 foi alterada.', read: false },
        { id: 3, text: 'Você tem 3 propostas a serem enviadas.', read: false },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const notificationsRef = useRef(null);
    const userMenuRef = useRef(null);

    useClickOutside(notificationsRef, () => setNotificationsOpen(false));
    useClickOutside(userMenuRef, () => setUserMenuOpen(false));

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    return (
        <header className="h-16 flex items-center justify-end px-6 bg-light-bg-secondary dark:bg-dark-bg-secondary border-b border-light-border dark:border-dark-border flex-shrink-0">
            <div className="flex items-center space-x-4">
                
                {/* --- BOTÃO DE TEMA RESTAURADO --- */}
                <button 
                  onClick={toggleTheme} 
                  className="p-2 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                >
                  {isDark ? 
                    <SunIcon className="w-6 h-6" /> : 
                    <MoonIcon className="w-6 h-6" />
                  }
                </button>
                
                {/* Ícone de Notificações */}
                <div className="relative" ref={notificationsRef}>
                    <button
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                        className="p-2 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                    >
                        <BellIcon className="w-6 h-6" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-yellow-400 ring-2 ring-white dark:ring-dark-bg-secondary"></span>
                        )}
                    </button>

                    {notificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-md shadow-lg z-10">
                            {/* ... (conteúdo do dropdown de notificações) ... */}
                        </div>
                    )}
                </div>

                {/* Menu do Utilizador */}
                <div className="relative" ref={userMenuRef}>
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-2 px-3 py-2 rounded-md border border-light-border dark:border-dark-border hover:bg-light-border dark:hover:bg-dark-border"
                    >
                        <UserCircleIcon className="w-6 h-6 text-light-text-secondary dark:text-dark-text-secondary" />
                        
                        {user && (
                            <span className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                            {(user?.first_name || user?.username || 'Carregando...').toUpperCase()}
                            </span>
                        )}
                        
                        <ChevronDownIcon className={`w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {userMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-md shadow-lg z-10 py-1">
                            <Link to="/perfil" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-light-text-primary dark:text-dark-text-primary hover:bg-light-border dark:hover:bg-dark-border">
                                <UserCircleIcon className="w-5 h-5" />
                                Minha Conta
                            </Link>
                            <Link to="/arquivos" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-light-text-primary dark:text-dark-text-primary hover:bg-light-border dark:hover:bg-dark-border">
                                <ArchiveBoxIcon className="w-5 h-5" />
                                Meus Arquivos
                            </Link>
                            <div className="border-t border-light-border dark:border-dark-border my-1"></div>
                            <button onClick={() => { logoutUser(); setUserMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50">
                                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                Sair
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;