# src/hooks/

**Purpose:** Cross-feature reusable React hooks — generic, blind to the
business domain. A hook that knows what a `Product` or a `Cart` is belongs in
the feature that owns it, not here.

## Key Components

- `useDocumentMeta.ts` — writes the page metadata into `<head>`: title, meta
  description, canonical link, `robots` and JSON-LD. Every route calls it; the
  text it writes is computed by `src/lib/seo.ts`.

## Dependencies

- `react` (`useEffect`)
- `src/lib/seo.ts` and `src/lib/env.ts` — pure helpers and the site URL

## Patterns

- Hook filenames start with `use` (e.g. `useMediaQuery.ts`)
- Hooks return tuples or named objects, never positional booleans
- The decision ("what text goes in the title") lives in `lib/` and is pure; the
  hook only owns the effect on the DOM. That split is what makes both testable.
- Effects keyed on primitive values, not on the object literal a caller passes —
  a fresh object every render would re-run the effect every render

## Constraints

- ESLint forbids importing `@/features/*`, `@/pages/*`, `@/layouts/*` and
  `@/data/*` from here (see `eslint.config.js`)
- A hook becomes "shared" only after it has two real consumers; before that it
  stays in the feature slice that owns it
- Hooks must be SSR-safe: no `window` or `document` at module scope. Touching
  the DOM inside `useEffect` is fine — it does not run during a server render,
  which matters for the prerender work in
  `docs/plans/2026-09-22-seo-organico.md`
