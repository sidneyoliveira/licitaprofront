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

const Rodape = ({ toggleSidebar }) => {
    const { user, logoutUser } = useContext(AuthContext);
    const { isDark, toggleTheme } = useTheme();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);
    useClickOutside(userMenuRef, () => setUserMenuOpen(false));

    return (
        <footer className="fixed bottom-0 left-200 w-full bg-light-bg-secondary dark:bg-dark-bg-secondary p-3 md:p-3 border border-light-border dark:border-dark-border py-3 text-left">
            <p className="text-sm tracking-normal text-light-text-secondary dark:text-dark-text-secondary">
                <span className="font-semibold">L3 Solutions</span> • © 2025 - Todos os direitos reservados
            </p>
        </footer>
    );
};

export default Rodape;