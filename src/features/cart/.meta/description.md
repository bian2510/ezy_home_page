# src/features/cart/

**Purpose:** Carrito de compras: líneas, cantidades (con tope por stock del
ERP), totales y cierre de la compra por WhatsApp o paso al checkout por
transferencia con retiro (`/checkout`, feature `checkout`).

## Key Components

- `CartProvider.tsx` + `CartContext.tsx` + `useCart.ts` — estado del carrito, persistido en `localStorage`; un producto que ya no está en el catálogo se descarta al rehidratar
- `cartUtils.ts` — totales con los precios del ERP (Mercado Pago y transferencia) y armado del mensaje de WhatsApp
- `useCartContents.ts` — lógica que comparten el drawer y la página: totales, si se puede ir a `/checkout` (todo con precio y stock), el ajuste al cargar de una cantidad mayor al stock del ERP y las acciones de cada fila
- `useCartLine.ts` — lo de cada fila, compartido por las dos filas: precio de la línea (transferencia), tope por stock y las acciones de cantidad y quitar (con su toast)
- `CartDrawer.tsx` + `CartContents.tsx` — el carrito desplegado del header: card flotante bajo el header en `sm` y arriba, panel de alto completo en el celular (`Drawer` variante `floating`), título "Tu carrito (N)" con las unidades
- `CartDrawerItem.tsx` (fila compacta: foto, nombre, cantidad, tacho y total de la línea) y `CartDrawerSummary.tsx` (subtotal, envío por WhatsApp, total con transferencia y Mercado Pago, "Iniciar compra", WhatsApp y "Seguir comprando") — solo del drawer
- `CartPage.tsx` (`/carrito`, primer paso de la compra), `CartItemList.tsx`, `CartItem.tsx`, `CartSummary.tsx` (totales, "Comprar con retiro en punto pick-up" y WhatsApp) — UI de la página

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
