/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0b',
        foreground: '#fafafa',
        primary: {
          DEFAULT: '#3b82f6',
          foreground: '#ffffff',
        },
        card: {
          DEFAULT: '#111113',
          foreground: '#fafafa',
          border: '#27272a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
