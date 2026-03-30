// frontend/src/components/Card.jsx
import React from 'react';

const Card = ({ title, children, className }) => {
  return (
    <div className={`ui-card h-full ${className || ''}`}>
      {title && <h3 className="text-base font-semibold p-4 border-b border-slate-200/70 dark:border-slate-700/70 bg-slate-50/70 dark:bg-slate-800/35">{title}</h3>}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default Card;