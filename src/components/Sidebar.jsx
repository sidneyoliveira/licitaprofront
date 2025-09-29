// frontend/src/components/Sidebar.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  ArchiveBox,
  Users, 
  Bell, 
  Settings,
  Gavel
} from 'lucide-react'; // Usando os novos ícones

// Este componente NavItem lida com a lógica de cada link
const NavItem = ({ item, isOpen, isActive }) => {
  const { icon: Icon, label, path } = item;

  // Variantes para a animação do texto do menu
  const textVariants = {
    open: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    closed: { opacity: 0, x: -10, transition: { duration: 0.2 } },
  };

  return (
    <Link
      to={path}
      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-white border border-purple-500/30'
          : 'text-white/70 hover:text-white hover:bg-white/10'
      }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <AnimatePresence>
        {isOpen && (
          <motion.span
            variants={textVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="font-medium whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
};

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  // A nossa lista de menus, agora com os novos ícones e rotas corretas
  const menuItems = [
    { icon: LayoutDashboard, label: 'Início', path: '/' },
    { icon: FileText, label: 'Processos', path: '/processos' },
    { icon: ArchiveBox, label: 'Cadastros', path: '/cadastros' },
    { icon: Users, label: 'Usuários', path: '/usuarios' },
    { icon: Bell, label: 'Notificações', path: '/notificacoes' },
  ];
  
  const settingsItem = { icon: Settings, label: 'Configurações', path: '/configuracoes' };

  return (
    <>
      {/* Overlay para ecrãs pequenos quando o menu está aberto */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Componente Sidebar */}
      <motion.aside
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={{
          open: { width: '16rem' }, // 256px
          closed: { width: '5rem' }, // 80px
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-full bg-black/20 backdrop-blur-xl border-r border-white/20 z-50 flex flex-col"
      >
        <div className="p-6 flex flex-col h-full">
          {/* Cabeçalho do Sidebar */}
          <div className="flex items-center gap-3 mb-8 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <Gavel className="w-6 h-6 text-white" />
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-white font-bold text-xl whitespace-nowrap"
                >
                  Licita.PRO
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navegação Principal */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                isOpen={isOpen}
                isActive={location.pathname === item.path}
              />
            ))}
          </nav>
          
          {/* Rodapé com Configurações */}
          <div className="flex-shrink-0">
             <NavItem
                item={settingsItem}
                isOpen={isOpen}
                isActive={location.pathname === settingsItem.path}
              />
          </div>
        </div>
      </motion.aside>
    </>
  );
};

// Precisamos de AnimatePresence para as animações de entrada/saída
import { AnimatePresence } from 'framer-motion';
export default Sidebar;