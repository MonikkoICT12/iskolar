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
          blue: '#3730a3',      // Primary indigo blue (indigo-700)
          navy: '#312e81',      // Darker indigo for headers (indigo-900)
          bluelight: '#6366f1', // Lighter indigo for accents (indigo-500)
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
