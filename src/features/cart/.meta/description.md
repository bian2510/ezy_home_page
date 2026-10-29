# src/features/cart/

**Purpose:** Carrito de compras: líneas, cantidades (con tope por stock del
ERP), totales y cierre de la compra por WhatsApp o paso al checkout por
transferencia con retiro (`/checkout`, feature `checkout`).

## Key Components

- `CartProvider.tsx` + `CartContext.tsx` + `useCart.ts` — estado del carrito, persistido en `localStorage`; un producto que ya no está en el catálogo se descarta al rehidratar
- `cartUtils.ts` — totales con los precios del ERP (Mercado Pago y transferencia) y armado del mensaje de WhatsApp
- `CartDrawer.tsx`, `CartPage.tsx`, `CartContents.tsx`, `CartItem.tsx` — UI del carrito; `CartContents` ajusta al cargar una cantidad mayor al stock del ERP y enlaza a `/checkout` cuando todo tiene precio y stock

## Dependencies

- `@/features/pricing` — `usePricing` para el precio de cada línea y los totales
- `@/features/toast` — avisos
- `@/data/catalog` — reconciliar un carrito guardado
- `@/lib/env` — número de WhatsApp

## Patterns

- Context → Provider → hook (`docs/standards/gestion-estado.md`, ADR F001-001)
- El carrito guarda productos, no precios: el precio siempre se lee del ERP al mostrar

## Constraints

- El carrito no se pierde entre sesiones sin acción del usuario (DOMAIN.md)
- Las líneas sin precio del ERP dicen "consultar precio" y no suman al total
- No llama al backend
