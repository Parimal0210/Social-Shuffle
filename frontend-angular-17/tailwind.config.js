/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        shuffle: {
          dark: '#0A1128',
          card: '#0D1527',
          cardLight: '#111C3B',
          border: '#1F305E',
          orange: '#FF6036',
          teal: '#35C8A8',
          gold: '#FFC226',
          purple: '#8F43EE'
        }
      }
    },
  },
  plugins: [],
}
