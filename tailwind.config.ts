import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Surfaces — driven by CSS vars so light/dark swap cleanly.
        bg: {
          DEFAULT: 'rgb(var(--color-bg) / <alpha-value>)',
          panel: 'rgb(var(--color-bg-panel) / <alpha-value>)',
          subtle: 'rgb(var(--color-bg-subtle) / <alpha-value>)',
          sidebar: 'rgb(var(--color-bg-sidebar) / <alpha-value>)',
          topbar: 'rgb(var(--color-bg-topbar) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
          subtle: 'rgb(var(--color-border-subtle) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          muted: 'rgb(var(--color-ink-muted) / <alpha-value>)',
          subtle: 'rgb(var(--color-ink-subtle) / <alpha-value>)',
          faint: 'rgb(var(--color-ink-faint) / <alpha-value>)',
          // Sidebar text — stays light in both modes since sidebar stays dark.
          onSidebar: 'rgb(var(--color-ink-on-sidebar) / <alpha-value>)',
          onSidebarMuted: 'rgb(var(--color-ink-on-sidebar-muted) / <alpha-value>)',
        },
        // Status colors — saturated foreground over tinted surfaces.
        ok: {
          DEFAULT: 'rgb(var(--color-ok) / <alpha-value>)',
          surface: 'rgb(var(--color-ok-surface) / <alpha-value>)',
          ring: 'rgb(var(--color-ok-ring) / <alpha-value>)',
        },
        bad: {
          DEFAULT: 'rgb(var(--color-bad) / <alpha-value>)',
          surface: 'rgb(var(--color-bad-surface) / <alpha-value>)',
          ring: 'rgb(var(--color-bad-ring) / <alpha-value>)',
        },
        warn: {
          DEFAULT: 'rgb(var(--color-warn) / <alpha-value>)',
          surface: 'rgb(var(--color-warn-surface) / <alpha-value>)',
          ring: 'rgb(var(--color-warn-ring) / <alpha-value>)',
        },
        // `info` is the brand accent (coral in PowerPixel) — many existing
        // components key off `info`, so changing this value re-skins them.
        info: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          surface: 'rgb(var(--color-accent-surface) / <alpha-value>)',
          ring: 'rgb(var(--color-accent-ring) / <alpha-value>)',
        },
      },
      borderRadius: {
        lg: '10px',
        xl: '14px',
        '2xl': '18px',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        pop: 'var(--shadow-pop)',
        ring: '0 0 0 4px rgb(var(--color-accent) / 0.20)',
        glow: '0 6px 18px -6px rgb(var(--color-accent) / 0.55)',
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
