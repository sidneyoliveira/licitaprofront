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
            // Efeito de "vidro fosco" que funciona nos dois temas
            className="sticky top-0 z-40 bg-light-bg-secondary/80 dark:bg-dark-bg-secondary/80 backdrop-blur-lg border-b border-light-border dark:border-dark-border"
        >
            <div className="flex items-center justify-between p-4 h-16">
                {/* Lado Esquerdo: Botão de Menu e Título da Página */}
                <div className="flex items-center gap-4">
                    <button onClick={toggleSidebar} className="p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                {/* Lado Direito: Ações */}
                <div className="flex items-center gap-3">
                    <button onClick={toggleTheme} className="p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <button className="p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/10 dark:hover:bg-white/10 transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-light-bg-secondary dark:border-dark-bg-secondary"></span>
                    </button>

                    {/* Menu do Utilizador */}
                    <div className="relative" ref={userMenuRef}>
                        <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                            <span className="font-semibold text-sm">
                                {(user?.first_name || user?.username || '').toUpperCase()}
                            </span>
                            <User className="w-5 h-5" />
                        </button>

                        {/* Dropdown do Utilizador */}
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
                                <Link to="/perfil" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-light-border dark:hover:bg-dark-border">
                                    <User className="w-4 h-4" /> Minha Conta
                                </Link>
                                <Link to="/arquivos" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-light-border dark:hover:bg-dark-border">
                                    <ArchiveBox className="w-4 h-4" /> Meus Arquivos
                                </Link>
                                <div className="border-t border-light-border dark:border-dark-border my-1"></div>
                                <button onClick={() => { logoutUser(); setUserMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50">
                                    <ArrowRightOnRectangle className="w-4 h-4" /> Sair
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