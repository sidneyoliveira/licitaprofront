// frontend/src/components/Header.jsx

import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { BellIcon, UserCircleIcon, ChevronDownIcon, ArchiveBoxIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

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

    // Estados para controlar a visibilidade dos dropdowns
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // Dados de exemplo para as notificações
    const [notifications, setNotifications] = useState([
        { id: 1, text: 'Novo processo "Pregão Eletrônico 123/2025" foi adicionado.', read: false },
        { id: 2, text: 'A data de abertura do certame 012/2025 foi alterada.', read: false },
        { id: 3, text: 'Você tem 3 propostas a serem enviadas.', read: false },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Referências para os elementos dos dropdowns
    const notificationsRef = useRef(null);
    const userMenuRef = useRef(null);

    // Usar o hook para fechar os dropdowns ao clicar fora
    useClickOutside(notificationsRef, () => setNotificationsOpen(false));
    useClickOutside(userMenuRef, () => setUserMenuOpen(false));

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    return (
        <header className="h-16 flex items-center justify-end px-6 bg-light-bg-secondary dark:bg-dark-bg-secondary border-b border-light-border dark:border-dark-border flex-shrink-0">
            <div className="flex items-center space-x-4">
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

                    {/* Dropdown de Notificações */}
                    {notificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-md shadow-lg z-10">
                            <div className="p-3 border-b border-light-border dark:border-dark-border flex justify-between items-center">
                                <h3 className="font-semibold text-sm">Notificações</h3>
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="text-xs text-accent-blue hover:underline">
                                        Marcar todas como lidas
                                    </button>
                                )}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {unreadCount > 0 ? (
                                    notifications.filter(n => !n.read).map(notification => (
                                        <a href="#" key={notification.id} className="block p-3 hover:bg-light-border dark:hover:bg-dark-border border-b border-light-border dark:border-dark-border last:border-b-0">
                                            <p className="text-sm">{notification.text}</p>
                                        </a>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                        Nenhuma notificação nova.
                                    </div>
                                )}
                            </div>
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
                        {/* --- ALTERAÇÃO AQUI --- */}
                        <span className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                            {(user?.username || 'Utilizador').toUpperCase()}
                        </span>
                        <ChevronDownIcon className={`w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown do Utilizador */}
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