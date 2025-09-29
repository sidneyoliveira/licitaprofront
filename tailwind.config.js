// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // A nossa paleta de cores original
        'dark-bg-primary': '#0A0E1E',
        'dark-bg-secondary': '#152137',
        'dark-border': '#5D647E',
        'dark-text-primary': '#EAEFFB',
        'dark-text-secondary': '#A4A9B8',
        
        'light-bg-primary': '#F3F4F6',
        'light-bg-secondary': '#FFFFFF',
        'light-border': '#E5E7EB',
        'light-text-primary': '#1F2937',
        'light-text-secondary': '#6B7280',

        'accent-blue': '#3B82F6',
        'accent-green': '#22C55E',
      },
      fontFamily: {
        // Mantenha a fonte que você preferir (Montserrat ou Goldplay)
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [], // Removido o tailwindcss-animate
}