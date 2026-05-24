# tests/

**Purpose:** Vitest test suites and shared setup for the storefront.

## Key Components
- `setup.ts` — Vitest setup file; registers `@testing-library/jest-dom` matchers
- `unit/` — pure unit tests (helpers, hooks, component logic in isolation)
- `integration/` — multi-component tests rendered through routing

## Dependencies
- `vitest` runner with jsdom environment (see `vitest.config.ts`)
- `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`
- Imports project code via the `@/*` alias

## Patterns
- Test filenames end with `.test.ts` or `.test.tsx`
- Co-located tests inside `src/features/<slice>/__tests__/` are also welcome for tight feedback loops
- Skipped tests must carry an inline reason

## Constraints
- Tests must not hit the real network; mock at the `fetch` or service boundary
- Snapshot tests are discouraged; prefer accessible queries (`getByRole`, `getByLabelText`)
- Keep individual test files focused (<= 300 lines, mirrors the clean-code limit)
