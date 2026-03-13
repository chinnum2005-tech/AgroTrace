/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E7D32',
          light: '#4CAF50',
          dark: '#1B5E20',
        },
        secondary: {
          DEFAULT: '#A5D6A7',
          light: '#C8E6C9',
          dark: '#81C784',
        },
        accent: {
          DEFAULT: '#6D4C41',
          light: '#8D6E63',
          dark: '#4E342E',
        },
        background: {
          DEFAULT: '#F5F5F5',
          paper: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
