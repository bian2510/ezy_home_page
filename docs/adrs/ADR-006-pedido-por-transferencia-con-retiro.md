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
- Mercado Pago no está en este paso (va en el PR 3e, detrás de
  `VITE_MERCADOPAGO_ENABLED`).

### Contrato (`checkout/ordersApi.ts`)

| Pedido                                                                                                                                                                             | Respuesta                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/store/orders` con `x-api-key`; body `{idempotency_key, payment_method: "transfer", accepted_privacy, buyer: {name, phone, email, document?}, items: [{sku, quantity}]}` | **201** pedido nuevo, **200** mismo intento; `{order: {token, number, status, total, expires_at, items[{sku, name, quantity, unit_price, line_total}], transfer{alias, cbu, holder, bank}, pickup{address, hours}}}`. **409** `{errors: {detail, items: [{sku, available}]}}`; **422** errores por campo (`buyer_name`, `buyer_phone`, `buyer_email`, `buyer_document`, `accepted_privacy`) o `detail` (SKU que no se vende, transferencia sin configurar, clave reusada); **429** `detail` (límite por IP o por comprador) |
| `GET /api/store/orders/:token` con `x-api-key`                                                                                                                                     | El mismo `order`, sin datos del comprador. **404** si no existe                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

`status`: `pending_payment`, `paid`, `expired`, `canceled`. Importes en pesos
enteros.

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
