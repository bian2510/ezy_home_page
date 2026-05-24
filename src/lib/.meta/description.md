# src/lib/

**Purpose:** Pure, framework-free helpers. Anything importable from a test
without rendering React belongs here.

## Key Components
- `cn.ts` — joins truthy class names with single spaces; consumed by UI primitives

## Dependencies
- None (intentionally stdlib-only)

## Patterns
- Each helper exports a single named function
- No default exports — they hurt refactor tooling
- Helpers are individually unit-tested under `tests/unit/`

## Constraints
- No React imports here; if you need React, use `src/hooks/` instead
- No I/O (no fetch, no localStorage); side-effectful helpers live in feature slices
- Keep functions small (<= 50 lines per the clean-code standard)
