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
          50: '#e6eef7',
          100: '#ccddef',
          200: '#99bbe0',
          300: '#6699d0',
          400: '#3377c1',
          500: '#0055b1',
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
