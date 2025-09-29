/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. Habilita o modo escuro baseado na classe 'dark' no elemento <html>
  darkMode: ["class"],
  
  // 2. Define os ficheiros onde o Tailwind irá procurar por classes para otimização.
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  
  // 3. Onde toda a personalização do design acontece.
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // 4. Define a nossa paleta de cores, usando variáveis CSS para flexibilidade.
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        // Nossas cores customizadas, que podemos usar diretamente.
        'accent-blue': '#3B82F6',
        'accent-green': '#22C55E',
      },
      // 5. Define o arredondamento dos cantos.
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // 6. Define a fonte padrão da aplicação como Montserrat.
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      // 7. Adiciona as animações de "acordeão" do novo design.
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  // 8. Adiciona o plugin para as animações.
  plugins: [require("tailwindcss-animate")],
}