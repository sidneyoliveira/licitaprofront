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
        // Cores do Modo Escuro (Dark Mode) - Sólidas e Formais
        'dark-bg-primary': '#0D1117',      // Um azul quase preto para o fundo
        'dark-bg-secondary': '#161B22',   // Um azul um pouco mais claro para cards e sidebar
        'dark-border': '#30363D',         // Uma borda sutil
        'dark-text-primary': '#E6EDF3',   // Texto principal claro
        'dark-text-secondary': '#7D8590', // Texto secundário com menos destaque
        
        // Cores do Modo Claro (Light Mode) - Limpas e Profissionais
        'light-bg-primary': '#F6F8FA',     // Fundo principal (cinza muito claro)
        'light-bg-secondary': '#FFFFFF',  // Fundo de cards (branco puro)
        'light-border': '#D0D7DE',        // Bordas mais definidas
        'light-text-primary': '#1F2328',  // Texto principal (preto suave)
        'light-text-secondary': '#656D76',// Texto secundário (cinza)

        // Cores de Acento Vivas
        'accent-blue': '#2F81F7',
        'accent-green': '#2DA44E',
        'accent-yellow': '#D29922',
        'accent-red': '#DA3633',
        'accent-purple': '#8957E5',
      },
      fontFamily: {
        sans: ['Rubik', 'sans-serif'], // Usando a fonte 'Sora' que é moderna e clara
      },
    },
  },
  plugins: [],
}