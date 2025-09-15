/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        'pastel-blue': '#a8e6cf',
        'pastel-purple': '#dda0dd',
        'pastel-pink': '#ffb3ba',
        'pastel-yellow': '#ffdfba',
      },
      gradientColorStops: {
        'gradient-primary': '#0ea5e9',
        'gradient-secondary': '#8b5cf6',
      }
    },
  },
  plugins: [],
}