/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        zbe: {
          red: '#FF3B30',
          green: '#34C759',
          blue: '#007AFF',
          dark: '#0A0A0F',
          card: '#16161D',
          border: '#2A2A35',
        }
      }
    },
  },
  plugins: [],
}
