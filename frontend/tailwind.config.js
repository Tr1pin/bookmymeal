/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{html,ts}" // Asegúrate de incluir los archivos de Angular
    ],
    theme: {
      extend: {
        colors: {
          primary: '#1E40AF', // Azul fuerte
          secondary: '#F59E0B', // Naranja vibrante
        },
      },
    },
    plugins: [],
  };
  