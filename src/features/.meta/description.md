# src/features/

**Purpose:** Vertical slices of the storefront. Each slice owns its own
components, hooks, state and backend calls so it can evolve independently.

## Key Components

- `catalog/` — listado, filtro por categoría y card de producto
- `cart/` — carrito persistido en `localStorage` y cierre por WhatsApp
- `pricing/` — precio y stock desde el ERP por SKU (ADR-005)
- `blog/` — posts estáticos en Markdown
- `toast/` — avisos efímeros

## Dependencies

- Shared primitives from `@/components/ui`
- Shared helpers from `@/lib`
- Shared hooks from `@/hooks`
- Catálogo estático desde `@/data/catalog`

## Patterns

- One directory per bounded slice; new slices require an entry here and a `.meta/description.md`
- Each slice exposes a public `index.ts` barrel; internals stay private
- Flat layout by default; `components/` and `hooks/` subfolders only past ~6 files (`docs/standards/modulos-feature.md`)
- Backend calls only in a `<recurso>Api.ts` file inside the slice (`docs/standards/llamadas-al-backend.md`)

## Constraints

- A slice imports another only through its `index.ts` (enforced by ESLint)
- `fetch` outside `*Api.ts` fails `pnpm lint`
- Slices must be testable in isolation (no implicit dependency on a parent layout)
- New slice = new `.meta/description.md` at slice root
