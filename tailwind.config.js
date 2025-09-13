/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#123456',
          secondary: '#89ABCD',
          accent: '#CBA35C'
        }
      }
    }
  },
  plugins: []
}
