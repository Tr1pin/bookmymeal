/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}" // Asegúrate de incluir los archivos de Angular
  ],
  theme: {
    fontFamily: {
      'cinzel': ['Cinzel', 'sans-serif']
    },
    extend: {
      colors: {
        primary: '#0a2240', // Azul más oscuro
        secondary: '#F59E0B', // Naranja vibrante
      },
    },
  },
  plugins: [],
};
