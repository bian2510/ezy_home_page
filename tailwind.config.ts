import type { Config } from 'tailwindcss';

// EzyHome design system tokens. Mobile-first breakpoints.
//
// Paleta, tipografía y radios del rediseño "Smart Commerce Slate" (2026-11):
// verde azulado mineral como color de acción, superficies verde muy claro y
// un gris oscuro para el footer. Los nombres semánticos de siempre
// (`primary`, `muted`, `card`…) se conservan con los valores nuevos, así el
// resto del sitio toma la paleta sin tocar cada componente.
// Guía de uso: docs/standards/tailwind-tokens.md.
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#f7faf8',
        foreground: '#181c1c',
        card: '#ffffff',
        muted: {
          DEFAULT: '#ebefed',
          foreground: '#466462',
        },
        border: '#e0e3e2',
        primary: {
          DEFAULT: '#006a67',
          foreground: '#ffffff',
          // Fondo del header. Texto blanco encima: contraste 4.5:1, el mínimo AA.
          container: '#2c8380',
          fixed: '#9ff1ed',
        },
        // Carteles de precio (descuento por transferencia).
        tertiary: {
          DEFAULT: '#8c4d2f',
          foreground: '#ffffff',
          soft: '#ffdbcd',
          'soft-foreground': '#70371b',
        },
        // Superficie oscura del footer.
        inverse: {
          DEFAULT: '#2d3131',
          foreground: '#eef1f0',
          muted: '#bec9c7',
          primary: '#83d4d1',
          border: '#454b4b',
        },
        sidebar: {
          DEFAULT: '#2d3131',
          foreground: '#eef1f0',
          accent: '#3a3f3f',
          border: '#454b4b',
        },
        success: '#4caf86',
        warning: {
          DEFAULT: '#d4a017',
          foreground: '#7a5a00',
        },
        destructive: '#ba1a1a',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        'headline-xl': ['2.5rem', { lineHeight: '3rem', letterSpacing: '-0.02em' }],
        'headline-xl-mobile': ['1.875rem', { lineHeight: '2.375rem', letterSpacing: '-0.01em' }],
        'headline-md': ['1.375rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        'headline-sm': ['1.125rem', { lineHeight: '1.5rem' }],
        'label-sm': ['0.625rem', { lineHeight: '0.75rem', letterSpacing: '0.05em' }],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        'card-hover':
          '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
        header: '0 4px 12px 0 rgba(15, 23, 42, 0.12)',
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
