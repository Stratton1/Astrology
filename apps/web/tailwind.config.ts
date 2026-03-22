import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cosmos: {
          // Deep space blues
          void: '#0a0a1a',
          deep: '#0d1117',
          navy: '#0f172a',
          // Celestial blues
          midnight: '#1e2d5a',
          indigo: '#2d3a8c',
          azure: '#3b5bdb',
          sky: '#4dabf7',
          // Gold & amber accents
          gold: '#f59f00',
          amber: '#e67700',
          stardust: '#ffd43b',
          // Deep purples
          nebula: '#6741d9',
          violet: '#7c3aed',
          lavender: '#a78bfa',
          // Neutrals
          silver: '#adb5bd',
          mist: '#dee2e6',
          // Semantic
          ascendant: '#4dabf7',
          midheaven: '#ffd43b',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-cinzel)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
        display: ['var(--font-cinzel)', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'cosmos-gradient': 'linear-gradient(135deg, #0a0a1a 0%, #0d1117 50%, #1e2d5a 100%)',
        'nebula-gradient': 'linear-gradient(135deg, #6741d9 0%, #3b5bdb 50%, #4dabf7 100%)',
        'gold-gradient': 'linear-gradient(135deg, #f59f00 0%, #ffd43b 100%)',
      },
      boxShadow: {
        glow: '0 0 20px rgba(75, 171, 247, 0.3)',
        'glow-gold': '0 0 20px rgba(245, 159, 0, 0.3)',
        'glow-violet': '0 0 20px rgba(124, 58, 237, 0.3)',
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
