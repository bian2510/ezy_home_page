# src/features/

**Purpose:** Vertical slices of the storefront. Each slice owns its own
components, hooks, types, and (later) API calls so it can evolve
independently.

## Key Components

- `catalog/` — product discovery, listing, filtering, detail (placeholder)
- `cart/` — cart state and checkout entry (placeholder)

## Dependencies

- Shared primitives from `@/components/ui`
- Shared helpers from `@/lib`
- Shared hooks from `@/hooks`

## Patterns

- One directory per bounded slice; new slices require an entry here and a `.meta/description.md`
- Each slice can expose a public `index.ts` barrel; internals stay private
- Slice-local components live under `<slice>/components/`, hooks under `<slice>/hooks/`, types under `<slice>/types.ts`

## Constraints

- No cross-feature imports (`catalog` may not import from `cart` directly) — go through `src/lib`, `src/hooks`, or lifted state
- Slices must be testable in isolation (no implicit dependency on a parent layout)
- New slice = new `.meta/description.md` at slice root
