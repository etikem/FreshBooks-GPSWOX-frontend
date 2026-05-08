import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Dark surface palette — matches /login (#050505 page, #0d0d0f panel,
        // #161618 input, #1f8bff accent, white/10 hairlines).
        bg: {
          DEFAULT: '#050505',
          panel: '#0d0d0f',
          subtle: '#161618',
        },
        border: {
          DEFAULT: '#1f1f24',
          subtle: '#16161a',
        },
        ink: {
          DEFAULT: '#fafafa',
          muted: '#a3a3ad',
          subtle: '#86868f',
          faint: '#6a6a73',
        },
        // Status colors — saturated foreground over dark tinted surfaces.
        ok: { DEFAULT: '#22c55e', surface: '#0f2a1c', ring: '#16a34a' },
        bad: { DEFAULT: '#f87171', surface: '#2a0f12', ring: '#dc2626' },
        warn: { DEFAULT: '#f59e0b', surface: '#2a1f0d', ring: '#92670a' },
        info: { DEFAULT: '#1f8bff', surface: '#0c1f33', ring: '#1f8bff' },
      },
      borderRadius: {
        lg: '10px',
        xl: '14px',
        '2xl': '18px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0, 0, 0, 0.35), 0 1px 3px rgba(0, 0, 0, 0.25)',
        pop: '0 12px 32px rgba(0, 0, 0, 0.55), 0 2px 6px rgba(0, 0, 0, 0.35)',
        ring: '0 0 0 4px rgba(31, 139, 255, 0.20)',
        glow: '0 4px 16px -4px rgba(31, 139, 255, 0.5)',
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
