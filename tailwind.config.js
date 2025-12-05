/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6eef5',
          100: '#ccddeb',
          200: '#99bbe7',
          300: '#6699d3',
          400: '#3377bf',
          500: '#0055ab',
          600: '#022763',
          700: '#011d4a',
          800: '#011432',
          900: '#000a19',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
