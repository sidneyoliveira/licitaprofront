import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  return (
    <div className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary flex relative overflow-hidden">
      <div className="pointer-events-none absolute -top-20 -left-24 h-72 w-72 rounded-full bg-accent-blue/20 blur-3xl z-0" />
      <div className="pointer-events-none absolute -top-16 right-0 h-64 w-64 rounded-full bg-cyan-300/25 dark:bg-cyan-500/20 blur-3xl z-0" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-blue-400/10 dark:bg-blue-500/10 blur-3xl z-0" />
      
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

      <div
        className={`flex-1 flex flex-col relative ${
          !isMobile ? (sidebarOpen ? 'lg:ml-64' : 'lg:ml-20') : ''
        }`}
      >
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main
          key={location.pathname}
          className="p-1 mx-2 my-2 relative z-10"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
