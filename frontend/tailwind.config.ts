import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c1d2ff',
          300: '#a2bcff',
          400: '#83a5ff',
          500: '#3b66f5', // Vibrant Blue
          600: '#254eda',
          700: '#1a3bb3',
          800: '#122a8c',
          900: '#0c1c65',
          DEFAULT: '#3b66f5',
        },
        secondary: {
          50: '#fff0f9',
          100: '#ffe1f3',
          200: '#ffc2e7',
          300: '#ffa3db',
          400: '#ff85cf',
          500: '#d946ef', // Vibrant Fuchsia
          600: '#b630ca',
          700: '#9320a5',
          DEFAULT: '#d946ef',
        },
        accent: {
          50: '#fff9eb',
          100: '#fff3d6',
          200: '#ffe7ad',
          300: '#ffdb85',
          400: '#ffcf5c',
          500: '#f59e0b', // Vibrant Amber
          DEFAULT: '#f59e0b',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-premium': 'linear-gradient(135deg, #3b66f5 0%, #d946ef 100%)',
        'gradient-soft': 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        'gradient-4d': 'linear-gradient(135deg, rgba(59,102,245,0.8) 0%, rgba(217,70,239,0.8) 100%)',
        'glass-gradient': 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1))',
      },
      boxShadow: {
        'premium': '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 5px 15px -5px rgba(0, 0, 0, 0.04)',
        'premium-hover': '0 20px 40px -5px rgba(0, 0, 0, 0.15), 0 10px 20px -5px rgba(0, 0, 0, 0.08)',
        'card': '0 4px 20px -1px rgba(0, 0, 0, 0.05), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        '4d': '0 20px 50px rgba(0, 0, 0, 0.1), inset 0 -5px 15px rgba(255, 255, 255, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)',
        '4d-hover': '0 40px 80px rgba(0, 0, 0, 0.15), inset 0 -5px 20px rgba(255, 255, 255, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.3)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'spin-slow': 'spin 8s linear infinite',
        'blob': 'blob 7s infinite',
        'float-delayed': 'float 8s ease-in-out infinite 2s',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
      maxWidth: {
        'container': '1280px',
      },
    },
  },
  plugins: [],
}

export default config
