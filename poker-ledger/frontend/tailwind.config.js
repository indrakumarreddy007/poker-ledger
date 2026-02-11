/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        casino: {
          gold: '#f59e0b',
          green: '#10b981',
          red: '#ef4444',
          black: '#0a0a0a',
          charcoal: '#1a1a1a',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          surface: '#18181b', // zinc-900
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(245, 158, 11, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
