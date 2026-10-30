# ADR-006: Pedido por transferencia con retiro en el local

**Fecha:** 2026-10-29
**Estado:** Propuesto. Registra decisiones del usuario del 2026-10-28 y 2026-10-29 (publicar la transferencia con retiro apenas esté, antes de Mercado Pago; vencimiento editable, 48 h por defecto; mostrar dirección y horario de retiro; tope de cantidad por stock sin "Quedan N"); falta su revisión de este documento.
**Relacionado:** [ADR-005](./ADR-005-precio-y-stock-desde-el-erp.md) (precio y stock desde el ERP). En el ERP: ADR-025 y el plan `docs/plans/2026-10-28-etapa-3-tienda-pedido-y-cobro.md` (PR 3a del ERP, PR 3d del sitio).

---

## Contexto

Hasta ahora el sitio cerraba toda compra por WhatsApp: el visitante mandaba el
carrito y EzyHome respondía con el total, la cuenta para transferir y el retiro.
Para quien retira en el local esa charla no aporta nada: el precio y el stock ya
los da el ERP (ADR-005). Además el carrito dejaba sumar más unidades de las que
había.

## Decisión

### Compra por transferencia con retiro

- El carrito ofrece **"Comprar con transferencia y retiro en el local"** cuando
  todos los productos tienen precio y stock del ERP. Si alguno no, solo queda
  WhatsApp (como antes). **Los envíos siguen por WhatsApp** hasta que haya
  cotizador.
- `/checkout` pide nombre y apellido, WhatsApp y email (obligatorios), DNI
  (opcional) y la aceptación del aviso de privacidad (Ley 25.326). El navegador
  valida igual que el ERP para avisar antes; el ERP vuelve a validar y manda.
- El ERP crea el pedido con **sus** precios (el sitio no manda precios) y el
  sitio lleva a `/pedido/:token`, que muestra número, total, a qué cuenta
  transferir (alias, CBU/CVU, titular, banco: lo que la tienda cargó), que ponga
  "Pedido N" en el concepto, hasta cuándo (hora de Argentina) y dónde y cuándo
  retirar. El carrito se vacía.
- Mercado Pago se suma en el PR 3e, detrás de `VITE_MERCADOPAGO_ENABLED` (ver
  [Mercado Pago](#mercado-pago-pr-3e)).

### Contrato (`checkout/ordersApi.ts`)

| Pedido                                                                                                                                                                                               | Respuesta                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/store/orders` con `x-api-key`; body `{idempotency_key, payment_method: "transfer" \| "mercado_pago", accepted_privacy, buyer: {name, phone, email, document?}, items: [{sku, quantity}]}` | **201** pedido nuevo, **200** mismo intento; `{order: {token, number, status, payment_method, total, expires_at, checkout_url, checkout_error, items[{sku, name, quantity, unit_price, line_total}], transfer{alias, cbu, holder, bank}, pickup{address, hours}}}`. **409** `{errors: {detail, items: [{sku, available}]}}`; **422** errores por campo (`buyer_name`, `buyer_phone`, `buyer_email`, `buyer_document`, `accepted_privacy`) o `detail` (SKU que no se vende, transferencia sin configurar, clave reusada); **429** `detail` (límite por IP o por comprador) |
| `GET /api/store/orders/:token` con `x-api-key`                                                                                                                                                       | El mismo `order`, sin datos del comprador. **404** si no existe                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

`status`: `pending_payment`, `paid`, `expired`, `canceled`. Importes en pesos
enteros. `payment_method` (`transfer` o `mercado_pago`) es obligatorio en la
respuesta: un pedido sin uno conocido se rechaza. `checkout_url` es el link de
Mercado Pago (`null` mientras el ERP lo crea; el sitio solo acepta `https`) y
`checkout_error: true` dice que MP no pudo crear el cobro. El ERP manda
`transfer` en todo pedido, también en los de MP: el sitio lo muestra solo si
`payment_method` es `transfer`.

### Mercado Pago (PR 3e)

Con `VITE_MERCADOPAGO_ENABLED=true` (plan de la etapa 3 del ERP §4 y §9, etapa
4 §6):

- `/checkout` ofrece **Transferencia bancaria** (elegida al entrar) o **Mercado
  Pago**, cada una con su total: el de MP sale de `price` (precio del local +
  recargo) y el de transferencia de `transferPrice`, los dos del ERP. El resumen
  muestra el total del medio elegido. Sin la variable, no hay elección.
- Con MP, el `POST` responde sin link (`checkout_url: null`; el ERP crea la
  orden por Oban). El sitio vacía el carrito y va a `/pedido/:token` con la marca
  `openMercadoPago`: "Abriendo Mercado Pago…" y `GET` cada **1 s hasta 15 s**.
  Cuando llega `checkout_url`, redirige (`window.location.assign`) y saca la
  marca del historial, así "atrás" muestra **Ir a pagar** en vez de volver a
  abrir MP. Abierta más tarde, la página no redirige: muestra **Ir a pagar**.
- Con `checkout_error: true` o sin link a los 15 s: "No pudimos abrir Mercado
  Pago. Podés pagar por transferencia o escribirnos por WhatsApp", con **Pagar
  por transferencia** (pedido **nuevo** con los mismos datos y otra
  `idempotency_key`; el de MP vence solo a los 30 minutos) y WhatsApp.
- Para eso el sitio guarda el comprador y los ítems del pedido de MP en
  `sessionStorage` de la pestaña (el ERP no devuelve el comprador y el carrito ya
  se vació). Se borra al cambiar a transferencia, cuando el pedido se cierra o al
  cerrar la pestaña. Sin storage no se ofrece el cambio: queda WhatsApp.
- **Vuelta de MP** (`/pedido/:token?resultado=…`). El ERP confirma el pago por
  el aviso de MP (etapa 4), no por la vuelta:
  - `ok`: "Recibimos tu pago" y `GET` cada **2 s hasta 30 s**. Si pasa a `paid`:
    "Pago confirmado. Te avisamos por email y WhatsApp para el retiro."; si no:
    "Estamos confirmando tu pago con Mercado Pago. Te avisamos por email."
  - `error`: "El pago no se completó", **Probar de nuevo con Mercado Pago** (el
    mismo `checkout_url`, solo si el pedido sigue pendiente y no pasó
    `expires_at`), **Pagar por transferencia** y WhatsApp.
  - `pendiente`: "Tu pago está pendiente".
- Un pedido cerrado manda sobre lo que diga la vuelta: `paid` → "Pago
  confirmado…", `expired` → venció porque no se completó el pago, `canceled` →
  cancelado. **Un pedido de MP nunca muestra la cuenta para transferir.**

### Reintentos sin duplicar

Cada intento de compra lleva una `idempotency_key` (UUID del navegador). Si el
comprador reintenta **lo mismo** (por ejemplo después de una falla de red) se
reusa la clave y el ERP devuelve el mismo pedido; si cambia algún dato es un
intento nuevo con clave nueva (el ERP rechaza una clave reusada con otros
datos). Lo maneja `useCreateOrder`.

### Errores

- **409:** se muestra cuántas unidades hay de cada producto y un botón
  "Ajustar el carrito".
- **422:** los errores por campo van al formulario; los generales, arriba.
- **429** y otros: el mensaje del ERP, o "escribinos por WhatsApp".
- **Sin red:** "Revisá tu conexión y probá de nuevo" (con la misma clave).

### Tope de cantidad por stock

Con el stock del ERP (`ProductPricing.stock`) la card, el detalle y el carrito
no dejan pasar del stock: el botón de sumar se deshabilita y aparece **"Llegaste
al máximo de unidades disponibles"**. No se muestra "Quedan N" (con 97 no dice
nada; usuario, 2026-10-28). Si el stock bajó desde que se armó el carrito, la
cantidad se ajusta al cargar. No es una reserva: el ERP vuelve a revisar el
stock al crear el pedido (409).

## Consecuencias

- Hay que desplegar el ERP con el PR 3a (pedidos y transferencia) y cargar en
  Configuración › Tienda online el alias o CBU, el titular y la dirección y
  horario de retiro **antes** de publicar este sitio: sin eso el ERP responde
  422 y el checkout muestra el mensaje del ERP.
- `/checkout` y `/pedido/` no se indexan (`noIndex` y `robots.txt`).
- La confirmación del pago la hace el usuario en el ERP (PR 3b): el sitio no
  sabe cuándo llegó la transferencia hasta que el pedido pasa a `paid`.

## Alternativas rechazadas

| Alternativa                                   | Razón de rechazo                                                  |
| --------------------------------------------- | ----------------------------------------------------------------- |
| Seguir solo con WhatsApp                      | Para retiro la charla no aporta y el pedido no queda en el ERP    |
| Mandar precios desde el sitio                 | El precio lo calcula el ERP; un precio manipulado no tiene efecto |
| Mostrar "Quedan N"                            | Con muchas unidades no dice nada (usuario, 2026-10-28)            |
| Esperar a Mercado Pago para abrir el checkout | La transferencia con retiro sirve sola (usuario, 2026-10-29)      |
| Confirmar el pago con `?resultado=ok`         | Esa URL la puede abrir cualquiera; manda el aviso de MP al ERP    |
| Pasar a transferencia volviendo a `/checkout` | El carrito ya se vació y habría que cargar todo otra vez          |
