# src/styles/

**Purpose:** Global stylesheet entry. Loads Tailwind layers and applies
base-level resets and focus styles.

## Key Components

- `global.css` — `@tailwind base/components/utilities` directives plus the base layer (font, focus ring, dynamic viewport height)

## Dependencies

- Tailwind directives processed by PostCSS (`postcss.config.js`)
- Reads design tokens from `tailwind.config.ts` via `theme()` calls

## Patterns

- All custom CSS sits inside `@layer base|components|utilities` so Tailwind can sort and purge correctly
- No selector lives outside a Tailwind layer

## Constraints

- This is the only global CSS file imported by `main.tsx`
- Component-specific CSS belongs next to the component as Tailwind classes, not new `.css` files
- Avoid `!important`; rely on Tailwind's layering instead
