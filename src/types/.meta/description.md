# src/types/

**Purpose:** Cross-feature shared TypeScript types. Keeps the global surface
small; feature-specific types live next to their feature.

## Key Components
- `index.ts` — currently exports `Locale` (`'es' | 'en'`)

## Dependencies
- None identified

## Patterns
- Re-export via `index.ts` so consumers import from `@/types`
- Prefer string-literal unions over enums (better tree-shaking and DX)

## Constraints
- Types here must be referenced by at least two features; otherwise colocate
- No runtime values — types and `as const` literals only
