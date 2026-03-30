import React from 'react';

export default function ActionButton({ text, onClick, variant = 'primary', icon: Icon, disabled = false }) {
  const baseStyle = "ui-btn";
  const styles = {
    primary: 'ui-btn-primary',
    secondary: 'bg-accent-green text-white hover:bg-accent-green/90',
    outlined: 'ui-btn-outline',
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${styles[variant]}`} disabled={disabled}>
      {Icon && <Icon className="w-5 h-5" />}
      <span>{text}</span>
    </button>
  );
}
