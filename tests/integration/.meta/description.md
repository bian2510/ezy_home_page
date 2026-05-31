# tests/integration/

**Purpose:** Integration tests that render multi-component flows through the
router. Verify wiring between layouts, pages, and shared chrome.

## Key Components

- `home-page.test.tsx` — renders `<App />` under `MemoryRouter` and asserts the welcome headline; includes a skipped placeholder for the future `/catalogo` route

## Dependencies

- `@testing-library/react` (`render`, `screen`)
- `react-router-dom` (`MemoryRouter`) for route-driven assertions
- `vitest` runner + `@testing-library/jest-dom` matchers

## Patterns

- Wrap the system under test in `MemoryRouter` with explicit `initialEntries`
- Query by role and accessible name first; fall back to text only when role is ambiguous
- Drive interactions with `userEvent`, not `fireEvent`

## Constraints

- No real network calls — mock at the API client boundary
- Tests must remain framework-agnostic enough to survive a router upgrade
- Keep render trees minimal; if a test needs everything, it probably belongs in an e2e suite
