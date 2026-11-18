# src/features/checkout/

**Purpose:** Compra con retiro en punto pick-up o envío a domicilio cotizado por
el ERP (ADR-007), por transferencia o con Mercado Pago (ADR-006). El visitante
deja sus datos y elige la entrega; el ERP crea el pedido con sus precios y la
página del pedido muestra a qué cuenta transferir o lleva a Mercado Pago, y
dónde retirar o el envío.

## Key Components

- `ordersApi.ts` — cliente de `POST /api/store/orders` y `GET /api/store/orders/:token`: único archivo con `fetch` de la feature; traduce `snake_case` → `camelCase`, valida la forma y tira `OrderApiError` con lo que explicó el ERP (campos, faltantes de stock, mensaje)
- `shippingApi.ts` — cliente de `POST /api/store/shipping/quotes`: único archivo con `fetch` de la cotización; descarta las opciones sin token o sin precio y tira con un status de error
- `shippingProvinces.ts` — las 24 provincias con el código de una letra del ERP (`Shipping.Names`)
- `deliveryUtils.ts` — reglas puras de la entrega: CP de 4 números, cuándo cotizar, validación de la dirección (igual a la del ERP), errores `shipping_*` del ERP a campos, la entrega del pedido y el costo del envío
- `useShippingQuote.ts` — cotiza cuando hay provincia, CP y carrito (`idle` / `loading` / `ready` / `unavailable`), vuelve a cotizar si cambian y con `refresh`
- `useCheckoutDelivery.ts` — estado de la entrega del checkout: retiro o envío, dirección y errores, cotización, costo y la entrega del pedido
- `useCreateOrder.ts` — envío del pedido y clave de intento (`idempotency_key`): se reusa al reintentar lo mismo, cambia si cambian los datos
- `useOrder.ts` — lee el pedido por token (`loading` / `ready` / `not_found` / `unavailable`) y lo vuelve a consultar según un plan (`timedOut` al terminar)
- `mercadoPagoUtils.ts` — reglas puras de MP: `?resultado=`, plan de consulta (1 s × 15 esperando el link, 2 s × 15 esperando el pago) y qué ver en cada estado
- `orderDraftStorage.ts` — comprador, ítems y entrega del pedido de MP en `sessionStorage`, para pasar a transferencia si MP falla (un borrador sin entrega se lee como retiro)
- `checkoutUtils.ts` — reglas puras: validación del formulario (igual a la del ERP), el comprador como va al ERP, totales (con el envío), descuento real de la transferencia sobre los totales, filas del resumen, cuándo se puede comprar, errores del ERP a campos y mensajes, ajustes de stock, vencimiento en hora de Argentina
- `CheckoutPage.tsx` — `/checkout` (paso 2): arma el pedido y lo envía; tarjetas numeradas (`CheckoutSection.tsx`): `BuyerFields.tsx` (datos y aviso de privacidad, Ley 25.326), `DeliveryOptions.tsx` (retiro o envío a domicilio; con envío, `AddressFields.tsx` y `ShippingQuoteStatus.tsx`: precio y plazo, o WhatsApp con el pedido y la dirección ya escritos si no hay cotización), `PaymentMethodField.tsx` (Mercado Pago / transferencia con su total y el "-N%"), `CheckoutSubmitButton.tsx`; `CheckoutSummary.tsx` (resumen con la entrega y ayuda por WhatsApp), `CheckoutBlocked.tsx`, `OrderErrorAlert.tsx`; `CheckoutTextField.tsx` es el campo de texto de los datos y la dirección
- `OrderPage.tsx` + `OrderLayout.tsx` — `/pedido/:token` (paso 3): tarjeta centrada con `OrderHero.tsx` (cabecera por estado), `OrderInfoCards.tsx` (retiro o envío a domicilio, y medio de pago), `TransferDetails.tsx` (cuenta, vencimiento y concepto), `OrderItems.tsx` (productos, envío y total) y `SmartHomeTip.tsx`
- `orderViewUtils.ts` — reglas puras de presentación del pedido: cabecera por estado, nombre y estado del medio de pago, cuándo va el consejo y si el mensaje de MP ya ofrece WhatsApp
- `MercadoPagoStatus.tsx` + `MercadoPagoMessage.tsx` — pedido de MP: abrir MP al llegar el link, vuelta de MP y estados; nunca la cuenta para transferir
- `SwitchToTransferButton.tsx` — "Pagar por transferencia": pedido nuevo con clave nueva

## Dependencies

- `@/features/cart` — ítems del carrito, vaciarlo y ajustarlo, y el mensaje de WhatsApp del pedido (`buildWhatsAppMessage`, con la dirección en el respaldo del envío)
- `@/features/pricing` — precio y disponibilidad del ERP
- `@/lib/env` — `getStoreApiUrl`, `getStoreApiKey`, `getWhatsAppNumber`
- `@/lib/redirect` — `goToExternalUrl` (salida a Mercado Pago, reemplazable en tests)
- ERP (`bian2510/ezy_home_app`, plan de la etapa 3) por HTTP

## Patterns

- Llamadas al backend según `docs/standards/llamadas-al-backend.md` (hooks por acción, sin Provider)
- Rutas lazy en `App.tsx`; las dos páginas con `noIndex` y fuera de `robots.txt`

## Constraints

- El sitio nunca manda precios: el pedido lleva SKU y cantidades y, con envío, el token de la cotización
- El link de MP solo se sigue si es `https`
- La vuelta de MP (`?resultado=ok`) no confirma nada: confirma el ERP con el aviso de MP
- `cart` no importa de `checkout` (evita el ciclo): el carrito solo enlaza a `/checkout`
