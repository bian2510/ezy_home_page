import type { Config } from 'tailwindcss';

// EzyHome design system tokens. Mobile-first breakpoints.
//
// Paleta, tipografía y radios del rediseño (2026-11), tomados del mock del
// catálogo (`code.html` + `screen.png` del export de Stitch), que es la fuente
// de verdad: donde el DESIGN.md del export dice otra cosa, manda el mock.
//
// Dos juegos de nombres con los mismos valores:
// - Los semánticos de siempre (`primary`, `muted`, `card`…), para que el resto
//   del sitio tome la paleta sin tocar cada componente.
// - Los del mock (`surface-container`, `on-primary`, `inverse-surface`…), que
//   usan las pantallas rediseñadas para calcar las clases del diseño.
// Guía de uso: docs/standards/tailwind-tokens.md.
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // --- Semánticos ---
        background: '#f8f9ff',
        foreground: '#0b1c30',
        card: '#ffffff',
        muted: {
          DEFAULT: '#e5eeff',
          foreground: '#545f73',
        },
        border: '#d3e4fe',
        primary: {
          DEFAULT: '#056765',
          foreground: '#ffffff',
          container: '#2f807e',
          fixed: '#a3f0ed',
        },
        // Fondo del header (el mock lo pinta aparte del `primary-container`).
        // Texto blanco encima: contraste 4.5:1, el mínimo AA.
        header: '#2c8380',
        sidebar: {
          DEFAULT: '#213145',
          foreground: '#eaf1ff',
          accent: '#2c3e55',
          border: '#3b4c63',
        },
        success: '#4caf86',
        warning: {
          DEFAULT: '#d4a017',
          foreground: '#7a5a00',
        },
        destructive: '#ba1a1a',

        // --- Nombres del mock ---
        surface: {
          DEFAULT: '#f8f9ff',
          'container-lowest': '#ffffff',
          'container-low': '#eff4ff',
          container: '#e5eeff',
          'container-high': '#dce9ff',
          'container-highest': '#d3e4fe',
          variant: '#d3e4fe',
        },
        'on-surface': {
          DEFAULT: '#0b1c30',
          variant: '#3f4948',
        },
        'on-primary': '#ffffff',
        secondary: '#545f73',
        tertiary: {
          DEFAULT: '#8d4b00',
          container: '#b15f00',
        },
        'on-tertiary': '#ffffff',
        outline: {
          DEFAULT: '#6f7978',
          variant: '#bec9c7',
        },
        'inverse-surface': '#213145',
        'inverse-on-surface': '#eaf1ff',
        'inverse-primary': '#87d4d1',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        'headline-xl': ['2.5rem', { lineHeight: '3rem', letterSpacing: '-0.02em' }],
        'headline-xl-mobile': ['1.875rem', { lineHeight: '2.375rem', letterSpacing: '-0.01em' }],
        'headline-md': ['1.375rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        'headline-sm': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'label-lg': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600' }],
        'label-md': ['0.75rem', { lineHeight: '1rem', fontWeight: '600' }],
        'label-sm': ['0.625rem', { lineHeight: '0.75rem', letterSpacing: '0.05em' }],
        'body-lg': ['1rem', { lineHeight: '1.5rem' }],
        'body-md': ['0.875rem', { lineHeight: '1.25rem' }],
        'body-sm': ['0.75rem', { lineHeight: '1rem' }],
      },
      // Radios del mock: más chicos que los de Tailwind por defecto.
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
      boxShadow: {
        header: '0 4px 12px 0 rgba(15, 23, 42, 0.12)',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        // Márgenes laterales del mock (`px-gutter md:px-margin`). En el celular
        // el sitio usa 16 px (`gutter-mobile`), la regla de siempre.
        'gutter-mobile': '1rem',
        gutter: '1.5rem',
        margin: '3rem',
      },
      maxWidth: {
        prose: '65ch',
        // Ancho del contenido en todo el sitio: el `max-w-7xl` (1280 px) de
        // los mocks del rediseño. Lo aplica `components/ui/Container.tsx`.
        content: '80rem',
      },
      objectPosition: {
        // Encuadre de la foto del hero en el celular: la vista a la ciudad.
        hero: '75% center',
      },
      minHeight: {
        // Alto del hero del Home en escritorio (`min-h-[660px]` del mock).
        hero: '41.25rem',
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
