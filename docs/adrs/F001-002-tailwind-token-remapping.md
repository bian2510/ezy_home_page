# ADR F001-002: Reemplazo completo de tokens Tailwind a paleta EzyHome

**Feature:** F001 — EzyHome Storefront Page  
**Fecha:** 2026-05-24  
**Estado:** Aceptado

---

## Contexto

El scaffold de proyecto-bootstrapper generó `tailwind.config.ts` con tokens genéricos (`brand`, `surface`, `text`) como placeholders. La paleta real de EzyHome tiene nombres semánticos distintos (`primary`, `background`, `foreground`, `card`, `muted`, `border`, `sidebar-*`, `success`, `warning`, `destructive`). Los componentes existentes (`Button.tsx`, `SiteHeader.tsx`) usan los nombres placeholder.

## Decisión

**Reemplazar completamente** `tailwind.config.ts` con los tokens EzyHome. Actualizar `Button.tsx` y `SiteHeader.tsx` a los nuevos nombres de clase. Regla de proyecto: ningún componente tiene hex hardcodeado — solo clases Tailwind que mapean a los tokens del config.

## Paleta definitiva en tailwind.config.ts

```typescript
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
}
```

**Tipografía:**
```typescript
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['Geist Mono', 'Menlo', 'monospace'],
}
```

Instalación: `@fontsource/inter` + `@fontsource/geist-mono` vía npm. Import en `src/main.tsx`.

## Justificación

- Nomenclatura coherente con la identidad de marca — los desarrolladores hablan de `primary`, `muted`, `destructive`, no de `brand-600`.
- Los componentes existentes son shells sin implementación real — costo de renombrar clases es mínimo ahora, creciente si se deja para después.
- Fontsource se bundlea con Vite → sin request DNS a Google Fonts → mejor LCP.
- Sin hex hardcodeado en componentes: regla aplicable via revisión de código en PRs.

## Consecuencias

- `Button.tsx` y `SiteHeader.tsx` deben actualizarse (cambio de `bg-brand-600` → `bg-primary`, etc.).
- Si se agrega `eslint-plugin-tailwindcss`, puede configurarse para advertir sobre clases no definidas en el config.
- La adición de futuros tokens semánticos (e.g., `info`, `surface`) sigue el mismo patrón de extensión en `tailwind.config.ts`.

## Alternativas rechazadas

| Alternativa | Razón de rechazo |
|---|---|
| Mantener namespace scaffold (brand/surface/text) | Naming confuso; diverge del vocabulario de la marca; deuda técnica inmediata |
| CSS variables + @layer base | Más verboso; duplica la definición de tokens cuando Tailwind ya lo resuelve |
| Google Fonts CDN | Request externo en carga → peor LCP; dependencia de DNS de Google |
