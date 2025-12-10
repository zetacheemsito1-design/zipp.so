/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zipp: {
          accent: '#9bdbc1', // Tu color Pantone PMS 337
          black: '#000000',
          white: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'fluffy': '32px',
      }
    },
  },
  plugins: [],
}