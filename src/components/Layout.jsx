// frontend/src/components/Layout.jsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  // Estado separado para a barra lateral de desktop (expandida/contraída)
  const [isDesktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  // Estado para a barra lateral de telemóvel (visível/escondida)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleDesktopSidebar = () => setDesktopSidebarOpen(prev => !prev);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(prev => !prev);

  return (
    <div className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary">
      {/* Passamos todos os estados e funções para o Sidebar */}
      <Sidebar 
        isDesktopOpen={isDesktopSidebarOpen} 
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />
      
      {/* O conteúdo principal ajusta a sua margem com base no estado do sidebar de DESKTOP */}
      <div className={`transition-all duration-300 ${isDesktopSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <Header 
          toggleDesktopSidebar={toggleDesktopSidebar}
          toggleMobileSidebar={toggleMobileSidebar}
        />
        
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Layout;