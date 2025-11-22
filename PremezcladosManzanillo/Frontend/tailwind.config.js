/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 💥 Color Primario Sincronizado con styles.css 💥
        'brand-primary': '#0F5C3B', 
        
        // Colores personalizados para el Modo Oscuro (El tono profundo de Stitch)
        'dark-primary': '#1A362C', 
        'dark-surface': '#264136',
                'dark-green-darker': '#144A34',
                'light-surface': '#F9FAFB',        'dark-btn': 'var(--dark-btn)',
      },
    },
  },
  plugins: [],
}