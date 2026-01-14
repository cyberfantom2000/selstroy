/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "../templates/**/*.html", 
    "../static/js/**/*.js"
  ],
  
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e6f4ef',
          100: '#cce9df',
          200: '#9fd3bf',
          300: '#72bd9f',
          400: '#3f9f77',
          500: '#0f7f55',
          600: '#05613b', // основной цвет
          700: '#044f31',
          800: '#033d26',
          900: '#022b1b',  
        }
      }
    },
  }
}
