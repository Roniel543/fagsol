/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores Primarios
        primary: {
          black: '#000',
          orange: '#F5A623',
          white: '#FFFFFF',
        },
        // Colores Secundarios
        secondary: {
          'dark-gray': '#1A1A1A',
          'medium-gray': '#282828',
          'light-gray': '#A3A3A3',
        },
        // Colores de Estado
        status: {
          error: '#FF6B6B',
          success: '#2D9B7F',
          info: '#1E5A6B',
          warning: '#FFD93D',
        },
        // Colores de Gráficos
        chart: {
          1: '#F5A623',
          2: '#2D9B7F',
          3: '#1E5A6B',
          4: '#FFD93D',
          5: '#FF9F43',
        },
      },
      fontFamily: {
        sans: ['var(--font-soraa)', 'system-ui', 'sans-serif'],
        sora: ['var(--font-soraa)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}