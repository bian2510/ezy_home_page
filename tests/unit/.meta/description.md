# tests/unit/

**Purpose:** Unit tests for pure helpers and isolated component logic. Fast,
deterministic, no rendering of router-aware components.

## Key Components

- `cn.test.ts` — exercises `@/lib/cn` (happy path, falsy filtering, one skipped placeholder)

## Dependencies

- `vitest` (`describe`, `it`, `expect`)
- Imports from `@/lib/*`, `@/types/*`, and pure modules under `@/features/*`

## Patterns

- One `describe` block per module under test
- Arrange-Act-Assert with the three sections visually separated by blank lines
- Use `it.skip(name, ...)` with a one-line reason when stubbing future behaviour

## Constraints

- No DOM rendering of large component trees here — that's `tests/integration/`
- No async I/O against the network or filesystem
