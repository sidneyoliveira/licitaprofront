// src/context/ThemeContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        // Adicionando logs para ver o que está acontecendo
        console.log("PASSO 1: Valor lido do localStorage:", savedTheme);

        if (savedTheme) {
            // AQUI ESTÁ O PONTO CRÍTICO
            const initialIsDark = savedTheme === 'dark';
            console.log(`PASSO 2: A condição "savedTheme === 'dark'" resultou em:`, initialIsDark);
            return initialIsDark;
        }
        
        console.log("PASSO 2: Nenhum tema salvo, usando o padrão 'false' (claro).");
        return false;
    });

    useEffect(() => {
        console.log("PASSO 3: Aplicando o tema. O estado 'isDark' é:", isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark(prevIsDark => !prevIsDark);
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};