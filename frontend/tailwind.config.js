/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans KR', 'system-ui', 'sans-serif'],
        serif: ['Noto Serif KR', 'Georgia', 'serif'],
      },
      colors: {
        primary: {
          50: '#f0f7f9',
          100: '#e0eff4',
          200: '#b8dde8',
          300: '#8cc5d4',
          400: '#5ba8bc',
          500: '#3B889F',
          600: '#2f6d81',
          700: '#285a6b',
          800: '#254a58',
          900: '#1f3d48',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
