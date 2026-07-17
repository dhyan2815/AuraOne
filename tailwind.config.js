import animate from 'tailwindcss-animate'
import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  safelist: [
    'border-primary/10',
    'focus:ring-primary/20',
    'text-text/30',
    'text-primary/50',
    'bg-primary/20',
    'bg-primary/40',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        tertiary: 'rgb(var(--color-tertiary) / <alpha-value>)',
        cta: '#F97316',
        background: 'rgb(var(--color-background) / <alpha-value>)',
        text: {
          DEFAULT: 'rgb(var(--color-text) / <alpha-value>)',
          variant: 'rgb(var(--color-text-variant) / <alpha-value>)',
        },
        'on-surface': 'rgb(var(--color-text) / <alpha-value>)',
        'on-surface-variant': 'rgb(var(--color-text-variant) / <alpha-value>)',
        'aurora-on-surface': 'rgb(var(--color-text) / <alpha-value>)',
        'aurora-on-surface-variant': 'rgb(var(--color-text-variant) / <alpha-value>)',

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
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '7': '28px',
        '9': '36px',
        '11': '44px',
      },
      borderRadius: {
        none: '0',
        xs: '0.25rem',
        sm: '0.375rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
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
        },
      },
    },
  },
  plugins: [animate, typography],
};