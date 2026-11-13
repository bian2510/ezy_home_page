# src/features/product/

**Purpose:** Piezas del detalle de producto (`/productos/:id`).
`pages/ProductDetailPage.tsx` busca el producto, pone los metadatos (JSON-LD
incluido) y las arma.

## Key Components

- `ProductBreadcrumb.tsx` — Inicio / Productos / categoría / producto, con el `Breadcrumb` común
- `ProductGallery.tsx` — imagen grande (LCP), miniaturas y el cartel "-N% transferencia"
- `PurchasePanel.tsx` — título, precios del ERP, "Ahorrás $ X pagando por transferencia", cantidad y agregar
- `ProductDescription.tsx` — tarjeta con la descripción de `products.json`
- `RelatedProducts.tsx` — "Mirá más productos" con la `ProductCard` del catálogo
- `StickyPurchaseBar.tsx` — barra de compra fija abajo en el celular, cuando el botón principal sale de pantalla
- `usePurchase.ts` + `productUtils.ts` — cantidad, tope por stock y agregar; los comparten el panel y la barra

## Dependencies

- `@/features/pricing` — precio, stock, `transferSavings`, `ConsultLink`
- `@/features/cart`, `@/features/toast` — agregar y avisar
- `@/features/catalog` — `ProductCard`, `selectRelatedProducts`, `outOfStockLast`
- `@/hooks/useInView`, `@/components/ui` (`Container`, `SectionBand`, `QuantitySelector`, `Icon`)

## Constraints

- Nada que no tengamos: sin cuotas, envío, "Más vendido", ofertas inventadas, chips de especificaciones ni variantes (usuario, 2026-11-03)
- No llama al backend: precio y stock llegan por `pricing`
