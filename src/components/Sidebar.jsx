// frontend/src/components/Sidebar.jsx

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Archive, // <-- Corrigido de ArchiveBox para Archive
  Users, 
  Bell, 
  Settings,
  Gavel,
  Building
} from 'lucide-react';

const NavItem = ({ item, isOpen, isActive }) => {
  const { icon: Icon, label, path } = item;
  const textVariants = {
    open: { opacity: 1, x: 0, transition: { duration: 0.2, delay: 0.1 } },
    closed: { opacity: 0, x: -10 },
  };

  return (
    <NavLink
      to={path}
      end={path === '/'}
      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-purple-500/30 to-indigo-500/30 text-white border border-purple-500/50 shadow-lg'
          : 'text-dark-text-secondary hover:text-white hover:bg-white/10'
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
    </NavLink>
  );
};

const Sidebar = ({ isOpen }) => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Início', path: '/' },
    { icon: FileText, label: 'Processos', path: '/processos' },
    { icon: Archive, label: 'Cadastros', path: '/cadastros' }, // <-- Corrigido
    { icon: Building, label: 'Fornecedores', path: '/fornecedores' },
    { icon: Users, label: 'Usuários', path: '/usuarios' },
    { icon: Bell, label: 'Notificações', path: '/notificacoes' },
  ];
  
  const settingsItem = { icon: Settings, label: 'Configurações', path: '/configuracoes' };

  return (
    <motion.aside
      initial={false}
      animate={isOpen ? "open" : "closed"}
      variants={{
        open: { width: '16rem' },
        closed: { width: '5rem' },
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full bg-light-bg-secondary dark:bg-dark-bg-secondary border-r border-light-border dark:border-dark-border z-50 flex flex-col"
    >
      <div className="p-6 flex flex-col h-full">
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
        
        <div className="flex-shrink-0">
           <NavItem
              item={settingsItem}
              isOpen={isOpen}
              isActive={location.pathname === settingsItem.path}
            />
        </div>
      </div>
    </motion.aside>
  );
};