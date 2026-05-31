# src/features/catalog/

**Purpose:** Product catalog slice — discovery, listing, filtering, and
product-detail UI. Currently a placeholder pending the J-001 customer
journey implementation.

## Key Components

- None yet (`.gitkeep` placeholder)

## Dependencies

- Future: `@/lib/api` for product fetches
- Future: `@/components/ui` primitives (`Button`, `Card`, `Badge`)

## Patterns

- Planned: server-state via a hook (`useProducts`, `useProduct`), local filter state via `useReducer`
- Planned: lazy-loaded product detail route to keep initial bundle small

## Constraints

- Mobile-first product grid: 1 column < 640px, 2 columns < 1024px, 3+ columns above
- Image lazy-loading and intrinsic dimensions are mandatory (CLS budget)
- No imports from `src/features/cart/` — coordinate via a shared interface in `src/types`
