// frontend/src/components/Header.jsx

import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';


// Hook customizado para detetar cliques fora de um elemento
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
    
    // Adicione a sua lógica de notificações aqui se necessário

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="sticky top-0 z-40 bg-light-bg-secondary/80 dark:bg-dark-bg-secondary/80 backdrop-blur-lg border-b border-light-border dark:border-dark-border"
        >
            <div className="flex items-center justify-between p-4 h-16">
                {/* Botão de Menu para expandir/contrair o Sidebar */}
                <div className="flex items-center gap-4">
                    <button onClick={toggleSidebar} className="p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                {/* Ações do Lado Direito */}
                <div className="flex items-center gap-3">
                    <button onClick={toggleTheme} className="p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <Link to="/notificacoes" className="p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/10 dark:hover:bg-white/10 transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-light-bg-secondary dark:border-dark-bg-secondary"></span>
                    </Link>

                    <Link to="/perfil" className="flex items-center gap-2 p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                        <span className="font-semibold text-sm">
                            {(user?.first_name || user?.username || '').toUpperCase()}
                        </span>
                        <User className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </motion.header>
    );
};

export default Header;