// frontend/src/components/Header.jsx
import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Bell, User, Menu, Sun, Moon, Archive as ArchiveIcon, LogOut as LogOutIcon } from 'lucide-react';

const useClickOutside = (ref, handler) => {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) return;
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        return () => document.removeEventListener('mousedown', listener);
    }, [ref, handler]);
};

const Header = ({ toggleSidebar }) => {
    const { user, logoutUser } = useContext(AuthContext);
    const { isDark, toggleTheme } = useTheme();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);
    useClickOutside(userMenuRef, () => setUserMenuOpen(false));

    return (
        <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="sticky top-0 z-40 bg-light-bg-secondary/80 dark:bg-dark-bg-secondary/80 backdrop-blur-lg border-b border-light-border dark:border-dark-border">
            <div className="flex items-center justify-between p-3 h-16">
                <button onClick={toggleSidebar} className="p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                    <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                    <button onClick={toggleTheme} className="p-2 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <Link to="/notificacoes" className="p-2 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-light-bg-secondary dark:border-dark-bg-secondary"></span>
                    </Link>

                    <div className="relative" ref={userMenuRef}>
                        <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                            <span className="font-semibold text-sm">{(user?.first_name || user?.username || '').toUpperCase()}</span>
                            <User className="w-5 h-5" />
                        </button>
                        {userMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 mt-2 w-56 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-md shadow-lg z-50 py-1"
                            >
                                <div className="px-4 py-2 border-b dark:border-dark-border">
                                    <p className="text-sm font-semibold">{(user?.first_name || user?.username)}</p>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary truncate">{user?.email}</p>
                                </div>
                                <Link to="/perfil" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-light-border dark:hover:bg-dark-border w-full">
                                    <User className="w-4 h-4" /> Minha Conta
                                </Link>
                                <Link to="/arquivos" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-light-border dark:hover:bg-dark-border w-full">
                                    <ArchiveIcon className="w-4 h-4" /> Meus Arquivos
                                </Link>
                                <div className="border-t border-light-border dark:border-dark-border my-1"></div>
                                <button onClick={() => { logoutUser(); setUserMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50">
                                    <LogOutIcon className="w-4 h-4" /> Sair
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </motion.header>
    );
};

export default Header;