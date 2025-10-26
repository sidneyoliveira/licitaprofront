/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg-primary': '#0b1437',
        'dark-bg-secondary': '#111c44',
        'dark-border': '#30363D',
        'dark-text-primary': '#E6EDF3',
        'dark-text-secondary': '#7D8590',
        
        'light-bg-primary': '#E7EDF8',
        'light-bg-secondary': '#FFFFFF',
        'light-border': '#D0D7DE',
        'light-text-primary': '#111c44',
        'light-text-secondary': '#656D76',

        'accent-blue': '#124a9b',
        'accent-green': '#2DA44E',
        'secondary-green': '#038C3E',
        'accent-yellow': '#D29922',
        'accent-red': '#DA3633',
        'accent-purple': '#8957E5',
        'accent-orange': '#FF7630',
        'accent-cyan': '#29CCB9',
      },
      fontFamily: {
        sans: ['Rubik', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}