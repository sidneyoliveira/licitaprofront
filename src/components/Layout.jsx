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
    <div className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary flex overflow-x-hidden">
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
        className={`flex-1 flex flex-col relative min-w-0 ${
          !isMobile ? (sidebarOpen ? 'lg:ml-64' : 'lg:ml-20') : ''
        }`}
      >
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main
          key={location.pathname}
          className="p-2 sm:p-3 md:p-4 overflow-x-hidden"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
