import React from 'react';

export default function ActionButton({ text, onClick, variant = 'primary', icon: Icon, disabled = false }) {
  const baseStyle =
    "flex items-center justify-center gap-2 px-6 py-2.5 rounded-md font-semibold text-sm transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-2 focus:ring-orange-400',
    secondary: 'bg-teal-500 text-white hover:bg-teal-600 focus:ring-2 focus:ring-teal-400',
    outlined:
      'bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-dark-border text-slate-700 dark:text-dark-text-secondary hover:bg-slate-50 dark:hover:bg-dark-bg-tertiary',
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${styles[variant]}`} disabled={disabled}>
      {Icon && <Icon className="w-5 h-5" />}
      <span>{text}</span>
    </button>
  );
}
