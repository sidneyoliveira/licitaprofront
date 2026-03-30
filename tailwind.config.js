/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg-primary': '#0f172a',
        'dark-bg-secondary': '#1e293b',
        'dark-border': '#334155',
        'dark-text-primary': '#f1f5f9',
        'dark-text-secondary': '#94a3b8',
        
        'light-bg-primary': '#eef2f7',
        'light-bg-secondary': '#ffffff',
        'light-border': '#e2e8f0',
        'light-text-primary': '#0f172a',
        'light-text-secondary': '#64748b',

        'accent-blue': '#2563eb',
        'accent-blue-hover': '#1d4ed8',
        'accent-blue-soft': '#dbeafe',
        'accent-cyan-soft': '#67e8f9',
        'accent-green': '#16a34a',
        'secondary-green': '#15803d',
        'accent-yellow': '#ca8a04',
        'accent-red': '#dc2626',
        'accent-purple': '#7c3aed',
        'accent-orange': '#ea580c',
        'accent-cyan': '#0891b2',
      },
      fontFamily: {
        sans: ['Rubik', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

