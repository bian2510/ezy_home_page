# src/features/cart/

**Purpose:** Shopping cart slice — line items, totals, persistence, and the
entry point to checkout. Currently a placeholder.

## Key Components

- None yet (`.gitkeep` placeholder)

## Dependencies

- Future: `@/types` for shared `Money`, `ProductRef` types
- Future: browser `localStorage` (wrapped) for cart persistence

## Patterns

- Planned: cart state via React context + reducer; selectors exposed via hooks
- Planned: optimistic line-item updates with rollback on API failure
- Planned: persistence layer behind a `CartStorage` interface so it can swap to a backend session later

## Constraints

- Cart actions must remain idempotent (safe to retry on flaky networks)
- No imports from `src/features/catalog/`
- Persisted shape requires a version field so schema migrations stay safe
