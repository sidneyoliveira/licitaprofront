import React from 'react';

const Card = ({ title, children, className }) => {
  return (
    <div className={`bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-light-border dark:border-dark-border p-6 h-full ${className}`}>
      {title && <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;