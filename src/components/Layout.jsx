import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Rodape from './Rodape';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  return (
    <div className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary flex relative overflow-hidden">
  
<div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-accent-blue to-[#0d3977] dark:bg-dark-bg-primary z-0" />

  {/* Sidebar e overlay mobile */}
  <AnimatePresence>
    {(sidebarOpen || !isMobile) && (
      <>
        <Sidebar
          isOpen={!isMobile ? sidebarOpen : true}
          isMobile={isMobile}
          onClose={() => setSidebarOpen(false)}
          className="z-50"
        />

        {isMobile && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </>
    )}
  </AnimatePresence>

  {/* Conteúdo principal */}
  <div
    className={`flex-1 flex flex-col transition-all duration-300 relative z-10 ${
      !isMobile ? (sidebarOpen ? 'lg:ml-64' : 'lg:ml-20') : ''
    }`}
  >
    <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

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
  </div>
</div>

  );
};

export default Layout;
