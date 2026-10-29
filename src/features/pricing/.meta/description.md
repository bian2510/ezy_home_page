# src/features/pricing/

**Purpose:** Precio y stock de la tienda desde el ERP, por SKU (ADR-005). Una
sola llamada al cargar el sitio; el resto de las features lee el resultado por
`usePricing`.

## Key Components

- `storeApi.ts` — cliente de `GET /api/store/products`: único archivo con `fetch`, lotes de 200 SKU, traduce `snake_case` → `camelCase` y descarta entradas con forma inválida
- `PricingProvider.tsx` — hace la llamada al montar (en `RootLayout`), guarda `loading` / `ready` / `unavailable` y avisa por `console.warn` los SKU que el ERP no devolvió
- `PricingContext.ts` + `usePricing.ts` — contrato del contexto y hook consumidor (`pricingOf(product)`)
- `pricingUtils.ts` — reglas puras: precio a mostrar, transferencia vs Mercado Pago, qué se puede comprar, textos de "Sin stock" / "Consultar precio", tope por stock (`reachedStockLimit`, `clampToStock`, aviso "Llegaste al máximo de unidades disponibles", sin "Quedan N")
- `ProductPrice.tsx` — precio en card y detalle (skeleton, un solo precio, o transferencia grande y Mercado Pago chico)
- `ConsultLink.tsx` — enlace a WhatsApp cuando no hay precio o stock

## Dependencies

- `@/lib/env` — `getStoreApiUrl`, `getStoreApiKey`, `isMercadoPagoEnabled`
- `@/data/catalog` — SKU del catálogo activo
- `@/types` — `Product`, `ProductPricing`, `Availability`
- ERP (`bian2510/ezy_home_app`, ADR-025) por HTTP

## Patterns

- Llamadas al backend según `docs/standards/llamadas-al-backend.md`
- Context → Provider → hook según `docs/standards/gestion-estado.md`
- Consumida por `catalog`, `cart`, `checkout` y `pages/ProductDetailPage` (JSON-LD y tope de cantidad) por su `index.ts`

## Constraints

- Nunca mostrar un precio que no venga del ERP: sin respuesta, "Consultar precio"
- `VITE_STORE_API_KEY` es pública (va en el bundle): solo lectura
- Sin `VITE_MERCADOPAGO_ENABLED=true`, un solo precio (transferencia)
- No importa de otras features
