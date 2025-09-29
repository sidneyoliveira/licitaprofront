import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ children }) => {
  // Adiciona a classe 'dark' ao <html> para ativar o modo escuro
  // Em uma aplicação real, você usaria um estado para controlar isso.

  return (
    <div className="flex h-screen bg-light-bg-primary dark:bg-dark-bg-primary font-sans text-light-text-primary dark:text-dark-text-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;