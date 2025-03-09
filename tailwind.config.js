/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chart: {
          bg: 'var(--chart-bg)',
          grid: 'var(--chart-grid)',
          text: 'var(--chart-text)',
          up: 'var(--up-color)',
          down: 'var(--down-color)',
        }
      }
    },
  },
  plugins: [],
}