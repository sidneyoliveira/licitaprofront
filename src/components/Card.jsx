// frontend/src/components/Card.jsx
import React from 'react';

const Card = ({ title, children, className }) => {
  return (
    <div className={`bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg border border-light-border dark:border-dark-border shadow-sm h-full ${className}`}>
      {title && <h3 className="text-base font-semibold p-4 border-b border-light-border dark:border-dark-border">{title}</h3>}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default Card;