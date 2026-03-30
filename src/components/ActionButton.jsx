import React from 'react';

export default function ActionButton({ text, onClick, variant = 'primary', icon: Icon, disabled = false }) {
  const baseStyle = "ui-btn";
  const styles = {
    primary: 'ui-btn-primary',
    secondary: 'bg-gradient-to-r from-accent-green to-emerald-500 text-white hover:from-accent-green hover:to-emerald-600 shadow-[0_8px_16px_rgba(16,185,129,0.25)]',
    outlined: 'ui-btn-outline',
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${styles[variant]}`} disabled={disabled}>
      {Icon && <Icon className="w-5 h-5" />}
      <span>{text}</span>
    </button>
  );
}
