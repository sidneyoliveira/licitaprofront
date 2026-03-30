/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg-primary': '#070b1c',
        'dark-bg-secondary': '#0f1836',
        'dark-border': '#30363D',
        'dark-text-primary': '#E6EDF3',
        'dark-text-secondary': '#7D8590',
        
        'light-bg-primary': '#EEF3FB',
        'light-bg-secondary': '#FFFFFF',
        'light-border': '#D0D7DE',
        'light-text-primary': '#111c44',
        'light-text-secondary': '#656D76',

        'accent-blue': '#1f6feb',
        'accent-blue-hover': '#1a5fd0',
        'accent-blue-soft': '#dbeafe',
        'accent-cyan-soft': '#67e8f9',
        'accent-green': '#2DA44E',
        'secondary-green': '#038C3E',
        'accent-yellow': '#D29922',
        'accent-red': '#DA3633',
        'accent-purple': '#8957E5',
        'accent-orange': '#FF7630',
        'accent-cyan': '#29CCB9',
        'surface-glass': 'rgba(255,255,255,0.72)',
        'surface-glass-dark': 'rgba(12,18,40,0.72)',
      },
      fontFamily: {
        sans: ['Rubik', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

