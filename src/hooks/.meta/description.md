# src/hooks/

**Purpose:** Cross-feature reusable React hooks. Currently empty — first
hooks land alongside the catalog slice (media queries, debounced search,
local-storage persistence).

## Key Components
- None yet (`.gitkeep` placeholder)

## Dependencies
- None identified

## Patterns
- Hook filenames start with `use` (e.g. `useMediaQuery.ts`)
- Hooks return tuples or named objects, never positional booleans
- Pure logic only — UI concerns live in components

## Constraints
- A hook becomes "shared" only after it has two real consumers; before that it stays in the feature slice that owns it
- Hooks must be SSR-safe (avoid `window` at module scope) in case we adopt SSR later
