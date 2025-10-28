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
      colors:{
        primario:{
          50:'#eff6ff',
          100:'#dbeafe',
          200:'#bfdbfe',
          300:'#bfdbfe',
          400:'#93c5fd',
          500:'#60a5fa',
          600:'#3b82f6',
          700:'#2563eb',
          800:'#1d4ed8',
          900:'#1e40af',
        },
        secundario:{
          50:'#f8fafc',
          100:'#f1f5f9',
          200:'#e2e8f0',
          300:'#cbd5e1',
          400:'#94a3b8',
          500:'#64748b',
          600:'#475569',
          700:'#334155',
          800:'#1e293b',
          900:'#0f172a',
        },
      },
      fontFamily:{
        sans:['Sora', 'system-ui', 'sans-serif'],
        sora:['Sora', 'sans-serif'],
      },
    },
  },
  plugins: [],
}