import React from 'react';

export default function DetailItem({ label, value, children }) {
  return (
    <div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="text-sm font-semibold text-slate-800 dark:text-dark-text-primary flex items-center gap-2 mt-1">
        {children}
        <span>{value || 'Não informado'}</span>
      </div>
    </div>
  );
}
