import React from 'react';

export default function StyledCheckbox({ checked, onChange, className = "" }) {
  return (
    <label
      className={`relative inline-flex items-center justify-center cursor-pointer select-none ${className}`}
      aria-checked={checked}
      role="checkbox"
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer absolute inset-0 z-20 m-0 h-full w-full cursor-pointer opacity-0"
      />
      <div
        className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded border-2 border-slate-300 dark:border-dark-border transition-colors duration-200 peer-checked:border-teal-500 peer-checked:bg-teal-500`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={3}
          stroke="currentColor"
          className={`h-3 w-3 text-white transition-opacity duration-200 ${checked ? 'opacity-100' : 'opacity-0'}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
    </label>
  );
}
import React from 'react';

export default function StyledCheckbox({ checked, onChange, className = "" }) {
  return (
    <label
      className={`relative inline-flex items-center justify-center cursor-pointer select-none ${className}`}
      aria-checked={checked}
      role="checkbox"
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer absolute inset-0 z-20 m-0 h-full w-full cursor-pointer opacity-0"
      />
      <div
        className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded border-2 border-slate-300 dark:border-dark-border transition-colors duration-200 peer-checked:border-teal-500 peer-checked:bg-teal-500`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={3}
          stroke="currentColor"
          className={`h-3 w-3 text-white transition-opacity duration-200 ${checked ? 'opacity-100' : 'opacity-0'}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
    </label>
  );
}
