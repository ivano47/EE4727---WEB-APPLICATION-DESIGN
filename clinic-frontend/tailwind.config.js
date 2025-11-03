import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2A3A6A',   // Our Navy
        secondary: '#C41E3A', // Our Red
        highlight: '#78B461', // Our Green
      },
      fontFamily: {
        sans: ['Open Sans', ...defaultTheme.fontFamily.sans],
        heading: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
