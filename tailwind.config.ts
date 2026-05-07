import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Linear/Stripe-like neutral surface palette.
        bg: {
          DEFAULT: '#fafafa',
          panel: '#ffffff',
          subtle: '#f4f4f5',
        },
        border: {
          DEFAULT: '#e4e4e7',
          subtle: '#f1f1f3',
        },
        ink: {
          DEFAULT: '#0a0a0a',
          muted: '#52525b',
          subtle: '#71717a',
          faint: '#a1a1aa',
        },
        // Status colors — pastel surface + saturated text/icon.
        ok: { DEFAULT: '#16a34a', surface: '#ecfdf5', ring: '#86efac' },
        bad: { DEFAULT: '#dc2626', surface: '#fef2f2', ring: '#fca5a5' },
        warn: { DEFAULT: '#d97706', surface: '#fffbeb', ring: '#fcd34d' },
        info: { DEFAULT: '#2563eb', surface: '#eff6ff', ring: '#93c5fd' },
      },
      borderRadius: {
        lg: '10px',
        xl: '14px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
        pop: '0 8px 24px rgba(16, 24, 40, 0.08), 0 2px 6px rgba(16, 24, 40, 0.04)',
        ring: '0 0 0 4px rgba(37, 99, 235, 0.12)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'slide-in-right': 'slide-in-right 220ms cubic-bezier(0.32, 0.72, 0, 1)',
        'slide-in-up': 'slide-in-up 180ms ease-out',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
