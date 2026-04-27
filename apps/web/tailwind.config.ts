import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        surface: '#13131a',
        card: '#1a1a24',
        border: '#2a2a3a',
        muted: '#4a4a5e',
        accent: {
          DEFAULT: '#7c3aed',  // violet
          foreground: '#ffffff',
          subtle: '#1e1b2e',
        },
        cyan: {
          accent: '#06b6d4',
        },
        text: {
          primary: '#f4f4f8',
          secondary: '#9494a8',
          muted: '#5a5a72',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
