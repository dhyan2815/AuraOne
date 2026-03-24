import animate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Aurora Glass Color Palette
        primary: {
          DEFAULT: '#4953bc',
          container: '#818cf8',
          fixed: '#e0e0ff',
          dim: '#bdc2ff',
        },
        secondary: {
          DEFAULT: '#674bb5',
          container: '#ab8ffe',
          fixed: '#e8ddff',
          dim: '#cebdff',
        },
        tertiary: {
          DEFAULT: '#a43073',
          container: '#e869ac',
          fixed: '#ffd8e7',
          dim: '#ffafd3',
        },
        'aurora-bg': '#faf8fd',
        'aurora-surface': '#faf8fd',
        'aurora-surface-low': '#f5f3f8',
        'aurora-surface-high': '#e9e7ec',
        'aurora-surface-highest': '#e3e2e7',
        'aurora-surface-lowest': '#ffffff',
        'aurora-on-surface': '#1b1b1f',
        'aurora-on-surface-variant': '#454653',
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        success: {
          DEFAULT: '#10b981',
          container: '#d1fae5',
        },
        warning: {
          DEFAULT: '#f59e0b',
          container: '#fef3c7',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '0.5': '4px',
        '1': '8px',
        '1.5': '12px',
        '2': '16px',
        '2.5': '20px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
        '8': '64px',
        '10': '80px',
        '12': '96px',
        '16': '128px',
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '1rem', // Aurora Glass 'lg'
        xl: '1.5rem', // Aurora Glass 'xl'
        '2xl': '2rem',
        '3xl': '3rem',
        full: '9999px',
      },
      boxShadow: {
        'aurora-glow': '0 0 30px rgba(73, 83, 188, 0.08)',
        'aurora-glow-lg': '0 0 50px rgba(73, 83, 188, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'aurora-float': 'auroraFloat 10s ease-in-out infinite',
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
        auroraFloat: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(2%, 4%) scale(1.05)' },
          '66%': { transform: 'translate(-1%, -2%) scale(0.98)' },
        }
      },
    },
  },
  plugins: [animate]
};