# src/features/checkout/

**Purpose:** Compra con retiro en el local, por transferencia o, con
`VITE_MERCADOPAGO_ENABLED=true`, con Mercado Pago (ADR-006). El visitante deja
sus datos, el ERP crea el pedido con sus precios y la página del pedido muestra
a qué cuenta transferir o lleva a Mercado Pago, y dónde retirar.

## Key Components

- `ordersApi.ts` — cliente de `POST /api/store/orders` y `GET /api/store/orders/:token`: único archivo con `fetch` de la feature; traduce `snake_case` → `camelCase`, valida la forma y tira `OrderApiError` con lo que explicó el ERP (campos, faltantes de stock, mensaje)
- `useCreateOrder.ts` — envío del pedido y clave de intento (`idempotency_key`): se reusa al reintentar lo mismo, cambia si cambian los datos
- `useOrder.ts` — lee el pedido por token (`loading` / `ready` / `not_found` / `unavailable`) y lo vuelve a consultar según un plan (`timedOut` al terminar)
- `mercadoPagoUtils.ts` — reglas puras de MP: `?resultado=`, plan de consulta (1 s × 15 esperando el link, 2 s × 15 esperando el pago) y qué ver en cada estado
- `orderDraftStorage.ts` — comprador e ítems del pedido de MP en `sessionStorage`, para pasar a transferencia si MP falla
- `checkoutUtils.ts` — reglas puras: validación del formulario (igual a la del ERP), total con transferencia, cuándo se puede comprar, errores del ERP a campos y mensajes, ajustes de stock, vencimiento en hora de Argentina
- `CheckoutPage.tsx` — `/checkout`: arma el pedido y lo envía; `BuyerFields.tsx` (datos y aviso de privacidad, Ley 25.326), `PaymentMethodField.tsx` (transferencia / Mercado Pago con su total), `CheckoutSummary.tsx`, `OrderErrorAlert.tsx`
- `OrderPage.tsx` — `/pedido/:token`: número, total, retiro y, por transferencia, cuenta, vencimiento y concepto
- `MercadoPagoStatus.tsx` + `MercadoPagoMessage.tsx` — pedido de MP: abrir MP al llegar el link, vuelta de MP y estados; nunca la cuenta para transferir
- `SwitchToTransferButton.tsx` — "Pagar por transferencia": pedido nuevo con clave nueva

## Dependencies

- `@/features/cart` — ítems del carrito, vaciarlo y ajustarlo
- `@/features/pricing` — precio y disponibilidad del ERP
- `@/lib/env` — `getStoreApiUrl`, `getStoreApiKey`, `getWhatsAppNumber`, `isMercadoPagoEnabled`
- `@/lib/redirect` — `goToExternalUrl` (salida a Mercado Pago, reemplazable en tests)
- ERP (`bian2510/ezy_home_app`, plan de la etapa 3) por HTTP

## Patterns

- Llamadas al backend según `docs/standards/llamadas-al-backend.md` (hooks por acción, sin Provider)
- Rutas lazy en `App.tsx`; las dos páginas con `noIndex` y fuera de `robots.txt`

## Constraints

- El sitio nunca manda precios: el pedido lleva SKU y cantidades
- Mercado Pago solo con `VITE_MERCADOPAGO_ENABLED=true`; el link de MP solo se sigue si es `https`
- La vuelta de MP (`?resultado=ok`) no confirma nada: confirma el ERP con el aviso de MP
- `cart` no importa de `checkout` (evita el ciclo): el carrito solo enlaza a `/checkout`
