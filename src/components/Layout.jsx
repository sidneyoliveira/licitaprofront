import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation(); // Usado para animar as transições de página

  return (
    // Fundo gradiente para o modo escuro, e um fundo simples para o modo claro
    <div className="min-h-screen bg-light-bg-primary dark:bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-light-text-primary dark:text-dark-text-primary">
      <Sidebar isOpen={sidebarOpen} />
      
      {/* O conteúdo principal agora ajusta a sua margem com base no estado do sidebar */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* AnimatePresence e motion.main para animar as transições entre páginas */}
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Layout;