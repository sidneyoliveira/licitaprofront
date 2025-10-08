/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg-primary': '#0D1117',
        'dark-bg-secondary': '#161B22',
        'dark-border': '#30363D',
        'dark-text-primary': '#E6EDF3',
        'dark-text-secondary': '#7D8590',
        
        'light-bg-primary': '#F6F8FA',
        'light-bg-secondary': '#FFFFFF',
        'light-border': '#D0D7DE',
        'light-text-primary': '#1F2328',
        'light-text-secondary': '#656D76',

        'accent-blue': '#2F81F7',
        'accent-green': '#2DA44E',
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