/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind genera solo las clases que aparecen en estos archivos.
  // Si añades clases nuevas en el HTML o en el JS, vuelve a ejecutar: npm run build
  content: ['./index.html', './js/**/*.js'],
  theme: { extend: {} },
  plugins: [],
};
