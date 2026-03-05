/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: '#F5F0E8',
        gray: {
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        success: '#4ade80',
        warning: '#fbbf24',
        error: '#f87171',
      },
      fontFamily: {
        sans: ['Sohne', 'system-ui', 'sans-serif'],
        display: ['Canela', 'Georgia', 'serif'],
        mono: ['Sohne Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
        'display-lg': ['3.5rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'display-md': ['2.5rem', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
        'display-sm': ['2rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.2' }],
        'heading-md': ['1.25rem', { lineHeight: '1.3' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.4' }],
        'body-lg': ['1rem', { lineHeight: '1.6' }],
        'body': ['0.9375rem', { lineHeight: '1.6' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.5' }],
        'caption': ['0.6875rem', { lineHeight: '1.4' }],
        'overline': ['0.5625rem', { lineHeight: '1.2', letterSpacing: '0.12em' }],
      },
      borderRadius: {
        DEFAULT: '0',
        none: '0',
        full: '9999px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
