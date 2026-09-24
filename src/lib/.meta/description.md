# src/lib/

**Purpose:** Pure, framework-free helpers. Anything importable from a test
without rendering React belongs here.

## Key Components

- `cn.ts` — joins truthy class names with single spaces; consumed by UI primitives
- `env.ts` — the single read point for `import.meta.env` (`getWhatsAppNumber`, `getSiteUrl`)
- `formatPrice.ts` — ARS currency formatting, whole pesos
- `seo.ts` — titles, canonical URLs, meta-description truncation and `schema.org/Product` JSON-LD

## Dependencies

- None (intentionally stdlib-only)

## Patterns

- Each helper exports a single named function
- No default exports — they hurt refactor tooling
- Helpers are individually unit-tested under `tests/unit/`

## Constraints

- No React imports here; if you need React, use `src/hooks/` instead
- No I/O (no fetch, no localStorage); side-effectful helpers live in feature slices
- No imports from any app layer — ESLint blocks `@/*` here entirely
- `env.ts` reads `import.meta.env`, never `process.env`: it does not exist in the browser bundle
- Keep functions small (<= 50 lines per the clean-code standard)
