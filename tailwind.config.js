import animate from 'tailwindcss-animate'
import typography from '@tailwindcss/typography'

const ch = (name) => `rgb(var(--${name}) / <alpha-value>)`

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
        // Living Map tokens.
        water: ch('water'),
        sheet: ch('sheet'),
        ink: ch('ink'),
        ink2: ch('ink2'),
        step: ch('step'),
        alert: ch('alert'),
        today: ch('today'),
        tasks: ch('tasks'),
        events: ch('events'),
        notes: ch('notes'),
        aura: ch('aura'),
        know: ch('know'),
        set: ch('set'),
        sec: ch('c'),

        // Legacy keys, remapped to the new tokens until every page is migrated.
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
        sans: ['Archivo', 'system-ui', 'sans-serif'],
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
        sheet: '28px',
        full: '9999px',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(.3,1.45,.5,1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
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
      },
    },
  },
  plugins: [animate, typography],
};
