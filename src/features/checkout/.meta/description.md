# src/features/checkout/

**Purpose:** Compra por transferencia con retiro en el local (ADR-006). El
visitante deja sus datos, el ERP crea el pedido con sus precios y la página del
pedido muestra a qué cuenta transferir y dónde retirar.

## Key Components

- `ordersApi.ts` — cliente de `POST /api/store/orders` y `GET /api/store/orders/:token`: único archivo con `fetch` de la feature; traduce `snake_case` → `camelCase`, valida la forma y tira `OrderApiError` con lo que explicó el ERP (campos, faltantes de stock, mensaje)
- `useCreateOrder.ts` — envío del pedido y clave de intento (`idempotency_key`): se reusa al reintentar lo mismo, cambia si cambian los datos
- `useOrder.ts` — lee el pedido por token (`loading` / `ready` / `not_found` / `unavailable`)
- `checkoutUtils.ts` — reglas puras: validación del formulario (igual a la del ERP), total con transferencia, cuándo se puede comprar, errores del ERP a campos y mensajes, ajustes de stock, vencimiento en hora de Argentina
- `CheckoutPage.tsx` — `/checkout`: formulario, resumen, aviso de privacidad (Ley 25.326) y errores
- `OrderPage.tsx` — `/pedido/:token`: número, total, cuenta para transferir, vencimiento y retiro

## Dependencies

- `@/features/cart` — ítems del carrito, vaciarlo y ajustarlo
- `@/features/pricing` — precio y disponibilidad del ERP
- `@/lib/env` — `getStoreApiUrl`, `getStoreApiKey`, `getWhatsAppNumber`
- ERP (`bian2510/ezy_home_app`, plan de la etapa 3) por HTTP

## Patterns

- Llamadas al backend según `docs/standards/llamadas-al-backend.md` (hooks por acción, sin Provider)
- Rutas lazy en `App.tsx`; las dos páginas con `noIndex` y fuera de `robots.txt`

## Constraints

- El sitio nunca manda precios: el pedido lleva SKU y cantidades
- Solo transferencia con retiro; Mercado Pago llega detrás de `VITE_MERCADOPAGO_ENABLED` (PR 3e)
- `cart` no importa de `checkout` (evita el ciclo): el carrito solo enlaza a `/checkout`
