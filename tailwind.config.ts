import type { Config } from 'tailwindcss';

// EzyHome design system tokens. Mobile-first breakpoints.
// Palette and typography sourced from DOMAIN.md and BR-007.
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#f4f7f9',
        foreground: '#1e2433',
        card: '#ffffff',
        muted: {
          DEFAULT: '#eef1f4',
          foreground: '#6b7280',
        },
        border: '#e2e8ef',
        primary: {
          DEFAULT: '#4a9e96',
          foreground: '#ffffff',
        },
        sidebar: {
          DEFAULT: '#242c3d',
          foreground: '#e8ecf0',
          accent: '#2e3a50',
          border: '#333d54',
        },
        success: '#4caf86',
        warning: {
          DEFAULT: '#d4a017',
          foreground: '#7a5a00',
        },
        destructive: '#e53935',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'Menlo', 'monospace'],
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      maxWidth: {
        prose: '65ch',
        content: '1200px',
      },
      keyframes: {
        'slide-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-slide': 'fadeSlide 0.4s ease-out',
        'slide-in-up': 'slide-in-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
