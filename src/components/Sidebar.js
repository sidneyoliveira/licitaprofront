// frontend/src/components/Sidebar.jsx

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Archive,
  Users, 
  Bell, 
  Settings,
  Gavel,
  Building
} from 'lucide-react';

// Componente para cada item de navegação, com lógica de estilo e animação
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
      className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-accent-blue/10 text-accent-blue font-semibold border border-accent-blue/20'
          : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-black/5 dark:hover:bg-white/5'
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

// Conteúdo reutilizável do Sidebar para as versões desktop e mobile
const SidebarContent = ({ isOpen }) => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Início', path: '/' },
    { icon: FileText, label: 'Processos', path: '/processos' },
    { icon: Archive, label: 'Entidades e Órgãos', path: '/entidades' },
    { icon: Building, label: 'Fornecedores', path: '/fornecedores' },
    { icon: Users, label: 'Usuários', path: '/usuarios' },
    { icon: Bell, label: 'Notificações', path: '/notificacoes' },
  ];
  
  const settingsItem = { icon: Settings, label: 'Configurações', path: '/configuracoes' };

  return (
    <div className="p-4 flex flex-col h-full">
      <div className={`flex items-center gap-3 mb-6 flex-shrink-0 ${isOpen ? 'px-2' : 'justify-center'}`}>
        <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-cyan-400 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
          <Gavel className="w-6 h-6 text-white" />
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="text-light-text-primary dark:text-dark-text-primary font-bold text-xl whitespace-nowrap"
            >
                L3 Soluções
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 space-y-1">
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
  );
};

// Componente principal do Sidebar, que gere a lógica responsiva
const Sidebar = ({ isDesktopOpen, isMobileOpen, setIsMobileOpen }) => {
  return (
    <>
      {/* --- SIDEBAR PARA TELEMÓVEL (GAVETA) --- */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Overlay escuro que fecha o menu ao clicar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            {/* O menu em si, que desliza da esquerda */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed left-0 top-0 h-full w-64 bg-light-bg-secondary dark:bg-dark-bg-secondary border-r border-light-border dark:border-dark-border z-50 lg:hidden"
            >
              <SidebarContent isOpen={true} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- SIDEBAR PARA DESKTOP --- */}
      {/* Fica escondido em ecrãs pequenos ('hidden') e visível em ecrãs grandes ('lg:flex') */}
      <motion.aside
        initial={false}
        animate={isDesktopOpen ? "open" : "closed"}
        variants={{
          open: { width: '16rem' }, // 256px
          closed: { width: '5rem' }, // 80px
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex fixed left-0 top-0 h-full bg-light-bg-secondary dark:bg-dark-bg-secondary border-r border-light-border dark:border-dark-border z-30 flex-col"
      >
        <SidebarContent isOpen={isDesktopOpen} />
      </motion.aside>
    </>
  );
};

export default Sidebar;