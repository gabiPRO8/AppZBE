/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        zbe: {
          red: '#EA4335',
          green: '#1E8E3E',
          blue: '#1A73E8',
          orange: '#F29900',
          bg: '#F1F3F4',
          card: '#FFFFFF',
          border: '#DADCE0',
          text: '#202124',
          muted: '#5F6368',
          subtle: '#F8F9FA',
        }
      },
      boxShadow: {
        'card': '0 1px 3px rgba(60,64,67,0.18), 0 4px 12px rgba(60,64,67,0.10)',
        'sheet': '0 -2px 10px rgba(60,64,67,0.18)',
      }
    },
  },
  plugins: [],
}
