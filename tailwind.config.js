/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#fbbc34',
          hover: '#fbb41b',
        },
        background: {
          light: '#ffffff',
          dark: '#0f172a',
        },
        text: {
          primary: '#1f2937',
          secondary: '#4b5563',
          light: '#f9fafb',
          dark: '#111827',
        },
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
}
