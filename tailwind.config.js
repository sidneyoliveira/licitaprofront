// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Habilita o modo escuro por classe (ex: <html class="dark">)
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores do Modo Escuro (Dark Mode) - ATUALIZADAS
        'dark-bg-primary': '#0A0E1E',      // Fundo principal (o mais escuro)
        'dark-bg-secondary': '#152137',   // Cor para cards e sidebar
        'dark-border': '#5D647E',         // Bordas
        'dark-text-primary': '#EAEFFB',   // Texto principal (ajustado para melhor contraste)
        'dark-text-secondary': '#A4A9B8', // Texto secundário (ajustado)
        
        // Cores do Modo Claro (Light Mode) - Mantidas
        'light-bg-primary': '#F3F4F6',
        'light-bg-secondary': '#FFFFFF',
        'light-border': '#E5E7EB',
        'light-text-primary': '#1F2937',
        'light-text-secondary': '#6B7280',

        // Cores de Acento - Mantidas
        'accent-blue': '#3B82F6',
        'accent-green': '#22C55E',
        'accent-green-bg': 'rgba(34, 197, 94, 0.1)',
        'accent-green-text': '#16A34A',
      },
      fontFamily: {
      // Substitui a fonte padrão 'sans' pela Goldplay
      sans: ['Rubik', 'sans-serif'], 
    },
    },
  },
  plugins: [],
}