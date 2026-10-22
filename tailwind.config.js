/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        lgu: {
          blue: '#0F2C59',
          navy: '#0B1E3D',
          gold: '#DAA520',
          goldlight: '#F3E5AB',
          green: '#059669',
          teal: '#0D9488',
        }
      }
    },
  },
  plugins: [],
}
