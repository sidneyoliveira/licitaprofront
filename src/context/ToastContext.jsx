import React, { createContext, useState, useContext, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    
    // Remove o toast após 4 segundos
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[9999] space-y-2">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const Toast = ({ message, type, onClose }) => {
  const baseStyle = "flex items-center w-full max-w-xs p-4 space-x-4 rtl:space-x-reverse divide-x rtl:divide-x-reverse rounded-lg shadow-lg text-sm";
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

