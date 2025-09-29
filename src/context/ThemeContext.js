// frontend/src/context/ThemeContext.js

import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Lógica para definir o tema claro como padrão se nada estiver guardado
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        return false; // Define o modo claro como padrão
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = useCallback(() => {
        setIsDark(prevIsDark => !prevIsDark);
    }, []);

    // Otimização para evitar re-renderizações desnecessárias
    const value = useMemo(() => ({ isDark, toggleTheme }), [isDark, toggleTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};