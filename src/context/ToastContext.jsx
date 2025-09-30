// frontend/src/context/ToastContext.jsx

import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

// --- CORREÇÃO AQUI: Criamos um contador fora do componente ---
let toastIdCounter = 0;
// -----------------------------------------------------------

const Toast = ({ message, type, onClose }) => {
  const baseStyle = "flex items-center w-full max-w-xs p-4 space-x-4 rtl:space-x-reverse divide-x rtl:divide-x-reverse rounded-lg shadow-lg text-sm transition-all duration-300 animate-in fade-in slide-in-from-top-5";
  const typeStyles = {
    success: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-200 divide-green-200 dark:divide-green-700",
    error: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 divide-red-200 dark:divide-red-700",
  };

  return (
    <div className={`${baseStyle} ${typeStyles[type]}`} role="alert">
      <div className="text-xl">
        {type === 'success' ? '✔' : '✖'}
      </div>
      <div className="ps-4 flex-1">{message}</div>
      <button onClick={onClose} className="p-1 -m-1 text-xl opacity-70 hover:opacity-100">&times;</button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    // --- CORREÇÃO AQUI: Usamos o contador em vez de Date.now() ---
    const id = toastIdCounter++;
    // -----------------------------------------------------------
    
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-5 right-5 z-[9999] space-y-2">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};