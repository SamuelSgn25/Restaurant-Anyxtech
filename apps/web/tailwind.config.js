/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: '#f4ecdd',
        clay: '#aa5c3d',
        forest: '#214338',
        gold: '#d8a25e',
        wine: '#6f2f2f',
        ink: '#17201d'
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['"Manrope"', 'sans-serif']
      },
      boxShadow: {
        card: '0 25px 80px rgba(23, 32, 29, 0.12)'
      }
    }
  },
  plugins: []
};
