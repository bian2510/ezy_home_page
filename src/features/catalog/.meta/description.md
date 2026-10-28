# src/features/catalog/

**Purpose:** Catálogo de productos: listado, filtro por categoría y card de
producto.

## Key Components

- `CatalogPage.tsx` — página del catálogo
- `ProductGrid.tsx`, `ProductCard.tsx` — grilla y card (precio, "Sin stock", agregar al carrito o consultar)
- `CategoryFilter.tsx` + `useCatalog.ts` — filtro por categoría derivado de los productos

## Dependencies

- `@/data/catalog` — vitrina estática (`products.json`)
- `@/features/pricing` — precio y stock del ERP (`ProductPrice`, `usePricing`, `isPurchasable`, `ConsultLink`)
- `@/features/cart`, `@/features/toast` — agregar al carrito y avisar
- `@/components/ui` — primitivos

## Patterns

- La vitrina (nombre, fotos, categoría) viene del JSON; precio y stock, de `pricing` (ADR-005)

## Constraints

- Mobile-first product grid: 1 column < 640px, 2 columns < 1024px, 3+ columns above
- Image lazy-loading and intrinsic dimensions are mandatory (CLS budget)
- No llama al backend: lo hace `pricing`
