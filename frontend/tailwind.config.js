/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          gold: '#D4AF37',
          dark: '#050505',
          goldLight: '#F3E5AB',
          goldDark: '#AA7C11',
        },
        customer: {
          bg: '#071B14',
          primary: '#2D6A4F',
          accent: '#D4A373',
          text: '#FAF8F1',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        cinzel: ['"Cinzel"', 'serif'],
        cinzelDec: ['"Cinzel Decorative"', 'serif'],
        pinyon: ['"Pinyon Script"', 'cursive'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
