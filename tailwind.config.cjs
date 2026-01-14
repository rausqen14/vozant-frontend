/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './**/*.{ts,tsx,js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Playfair Display', 'serif'],
        serif: ['Playfair Display', 'serif'],
        ui: ['IBM Plex Sans', 'sans-serif'],
        'cy-grotesk-grand': ['"cy grotesk grand"', 'sans-serif'],
        'tenor-sans': ['"Tenor Sans"', 'sans-serif'],
        editorial: ['Bodoni Moda', 'serif'],
      },
    },
  },
  plugins: [],
};
