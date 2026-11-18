# ADR-007: Envío a domicilio cotizado en el checkout

**Fecha:** 2026-11-17
**Estado:** Propuesto. Registra decisiones del usuario del 2026-11-17 (el sitio cotiza el envío contra `ezyhome_app` y no contra un correo; WhatsApp solo como respaldo cuando no hay cotización; mandar `province` desde ya; trabajar en `rediseno-ui` sin tocar `main`). Falta que el usuario revise este documento.
**Relacionado:** [ADR-006](./ADR-006-pedido-por-transferencia-con-retiro.md) (pedido con retiro y transferencia), [ADR-005](./ADR-005-precio-y-stock-desde-el-erp.md). En el ERP: ADR-030 (§4, §5, §7 y §9, y los apéndices "Simplificación" y "Tarifa propia").

---

## Contexto

Hasta ahora el checkout solo ofrecía retiro en punto pick-up, y el envío a
domicilio se coordinaba por WhatsApp (ADR-006). Eso dejaba abierto el riesgo
que marca `DOMAIN.md` (Risk Posture): el comprador no sabe el costo del envío
hasta hablar con EzyHome.

El ERP no se integra con un correo por ahora. Andreani no dio la cuenta y
Correo Argentino no dio las credenciales, así que cotiza con una **tarifa
propia**: tres tamaños de caja con un precio por anillo (AMBA, cercano, medio y
lejano), según la provincia y, en el AMBA, el CP (ADR-030, "Tarifa propia").
Para el sitio es una sola API, sin ningún correo en el medio.

## Decisión

### Entrega en el checkout

- La tarjeta **Entrega** ofrece **Retiro en punto pick-up** (sin cargo, elegida
  al entrar) o **Envío a domicilio**.
- Con envío a domicilio se piden provincia (select con las 24 provincias),
  código postal (4 números), calle, altura, piso y depto (opcional) y localidad.
  El navegador valida igual que el ERP.
- Con la provincia y el CP completos se cotiza. Se vuelve a cotizar si cambia la
  provincia, el CP o el carrito. La respuesta muestra el precio y el plazo, que
  se suman al resumen y al total de cada medio de pago. El envío cuesta lo mismo
  con transferencia y con Mercado Pago (ERP, `Store.OrderDelivery`).
- El cartel de descuento de la transferencia ("-5%") se calcula sobre los
  productos, sin el envío: el envío no tiene descuento y, sobre el total, el
  cartel bajaría al elegir envío (usuario, 2026-11-17).
- **Respaldo:** sin opción (`[]`), con error del ERP (404 mientras el ERP no
  tenga envíos, 422 por productos sin peso o medidas o que no entran en la caja
  grande), sin red o sin clave de la tienda, el checkout dice "Todavía no
  podemos calcular el envío desde la web", ofrece WhatsApp y recuerda el
  retiro. El texto no culpa a la zona: mientras el ERP no tenga envíos le pasa
  a todos. El link de WhatsApp abre el chat con el pedido (el mismo mensaje del
  carrito) y la dirección que cargó el comprador, pidiendo la cotización
  (usuario, 2026-11-17). El botón de confirmar queda apagado mientras falte la
  cotización.
- Si el ERP rechaza el pedido por la cotización (vencida, inválida o que ya no
  coincide), el checkout muestra el mensaje del ERP y pide una cotización nueva.

### Contrato (`checkout/shippingApi.ts` y `checkout/ordersApi.ts`)

| Pedido                                                                                                                                                                            | Respuesta                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/store/shipping/quotes` con `x-api-key`; body `{province, postal_code, items: [{sku, quantity}]}`                                                                       | **200** `{options: [{token, carrier, service, name?, price, delivery_time, expires_at}]}` (0 o 1 opción con la tarifa propia). **422** CP o ítems inválidos, productos sin peso o medidas; provincia inválida          |
| `POST /api/store/orders` (ADR-006) con, además, `delivery: "carrier"`, `shipping_quote_token` y `shipping: {street, street_number, floor_apartment, city, province, postal_code}` | El `order` de ADR-006 con `delivery` (`pickup` o `carrier`), `shipping: {carrier, service, price, delivery_time}` o `null`, y `total` con el envío. **422** `detail` de la cotización o errores por campo `shipping_*` |

- `province` es el código de una letra de ISO 3166-2:AR (B = Buenos Aires, C =
  CABA), la lista fija de `EzyHomeApp.Shipping.Names`
  (`checkout/shippingProvinces.ts`).
- El sitio nunca manda un precio: el pedido referencia la cotización por su
  token y el ERP la valida contra la empresa, el CP y los productos. La
  cotización vale 2 h.
- Con retiro el body del pedido es el mismo de ADR-006, sin campos de entrega.
- El sitio manda `province` en la cotización desde ya. El ERP la empieza a pedir
  con el PR de la tarifa propia; mientras tanto la ignora.
- Si falta `name`, el sitio muestra "Envío a domicilio". Una opción sin `token`
  o sin `price` numérico se descarta.

### Página del pedido

- Con envío, la tarjeta **Envío a domicilio** reemplaza a la del retiro. Muestra
  el plazo si viene y dice que se manda a la dirección que se cargó: el ERP no
  devuelve los datos del comprador.
- El detalle del pedido suma la línea **Envío a domicilio** antes del total, que
  ya la incluye.

### Mercado Pago a transferencia

El borrador de la pestaña (`orderDraftStorage.ts`) guarda también la entrega:
el pedido por transferencia sale con el mismo envío y la misma cotización,
mientras no haya vencido. Un borrador guardado antes de este cambio se lee como
retiro.

### Privacidad

El aviso de la Ley 25.326 suma la dirección: se usa solo para mandar el envío y,
con Mercado Pago, queda en la pestaña igual que el resto de los datos.

## Consecuencias

- El sitio se puede publicar antes que los envíos del ERP: mientras la
  cotización responda 404 o `[]`, el checkout ofrece WhatsApp, que es lo mismo
  que pasaba antes. Los textos del carrito y de Cómo comprar ya hablan de
  calcular el envío: conviene publicarlos con la tarifa propia andando en el
  ERP.
- Si cambia la lista de provincias o el contrato en el ERP, cambia acá
  (`llamadas-al-backend.md` §8).
- El sitio no conoce zonas, cajas ni precios: cambiar la tarifa es un dato del
  ERP.

## Alternativas rechazadas

| Alternativa                                                | Razón de rechazo                                                                                    |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Mandar a WhatsApp a todo el que quiera envío               | Da a entender que la web no cotiza y deja el costo para después de decidir (usuario, 2026-11-17)    |
| Cotizar con un botón "Calcular envío"                      | Con provincia y CP ya alcanza; un paso más en el celular sin nada que decidir                       |
| Calcular zona y precio en el sitio                         | El precio lo pone el ERP; la tabla cambia cada pocos meses y un precio del sitio se puede manipular |
| Dejar confirmar el pedido sin cotización y cotizar después | Es lo que se quiere evitar: pagar sin saber el envío                                                |
