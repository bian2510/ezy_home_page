# ADR-005: Precio y stock desde el ERP

**Fecha:** 2026-10-28
**Estado:** Propuesto. Registra decisiones que el usuario tomó el 2026-10-28 (camino 1, unión por SKU, "Consultar precio" en vez del precio del JSON, JSON-LD sin precio, un solo precio sin Mercado Pago); falta su revisión de este documento.

---

## Contexto

El catálogo vive en `src/data/products.json` (ver [`DOMAIN.md`](../../DOMAIN.md)):
nombre, descripción, fotos y categoría se editan a mano. El precio también vivía
ahí y se copiaba desde Mercado Libre con un script, junto con las ofertas
(`isOnSale`, `promotionalPrice`, `promotionBadge`). Resultado: precios
desactualizados respecto del local y sin stock real.

El ERP (repo `bian2510/ezy_home_app`) decidió tratar la tienda como un canal de
venta más, con precio propio y cobro con Mercado Pago:
[ADR-025 del ERP](https://github.com/bian2510/ezy_home_app/blob/main/docs/adrs/ADR-025-canal-tienda-online-y-cobro-con-mercado-pago.md).
Su etapa 1 ("camino 1") deja la vitrina en el JSON del sitio y pone el precio y
el stock en el ERP, unidos por SKU.

## Decisión

El sitio lee **precio y stock del ERP** al cargar. El JSON queda solo como
vitrina y lleva el `sku` de cada producto. El campo `price` del JSON y las
ofertas se eliminaron.

### Contrato

```
GET {VITE_STORE_API_URL}/api/store/products?skus=SKU-1,SKU-2,...
x-api-key: {VITE_STORE_API_KEY}
```

| Caso                         | Respuesta                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------- |
| OK                           | `200 {"products":[{"sku","price_mp","price_transfer","stock","available"}]}` |
| Sin clave o clave inválida   | `401`                                                                        |
| Sin `skus` o más de 200      | `422`                                                                        |
| SKU desconocido o sin precio | No viene en `products` (no es error)                                         |

- `VITE_STORE_API_URL` por defecto es `https://ezyhome.app`.
- Máximo **200 SKU por pedido**: el sitio parte el catálogo en lotes.
- La unión es **por SKU**, comparado sin mayúsculas ni espacios alrededor
  (`trim` + `toLowerCase`), igual que el ERP.
- Precios en pesos enteros: `price_mp` = precio del local + recargo de MP
  redondeado hacia arriba a $100; `price_transfer` = precio del local − descuento.
  Los porcentajes se configuran en el ERP, no en el sitio.
- **CORS:** el ERP solo acepta el origen `https://shop.ezyhome.app` (y
  `http://localhost:5173` en desarrollo). Las vistas previas de Cloudflare no
  reciben precios.
- **La clave es pública:** toda variable `VITE_*` termina en el bundle. Solo
  permite leer precio y stock de la empresa, que ya se muestran en el sitio. Si
  se abusa, se genera otra en el ERP y se reemplaza el secret del repo.

### Comportamiento

- **Una sola llamada** al cargar el sitio, para todo el catálogo activo, en
  memoria (`PricingProvider`). No hay caché persistente.
- **Mientras carga:** skeleton; no se puede agregar al carrito.
- **Si el ERP falla, no hay clave o el SKU no viene:** "Consultar precio" con
  enlace a WhatsApp, sin agregar al carrito. **Nunca** se muestra un precio del
  JSON. Los SKU que faltan se avisan con `console.warn`.
- **`available: false`:** "Sin stock" y consulta por WhatsApp.
- **JSON-LD:** con precio del ERP publica `offers` (precio y disponibilidad);
  sin precio del ERP, el producto sale **sin** `offers`.
- **Mercado Pago:** mientras la variable de repo `VITE_MERCADOPAGO_ENABLED` no
  sea `true` (hasta la etapa 3 del ADR-025), cada producto muestra un solo
  precio: el de transferencia. Con la variable activa, el de transferencia es
  el grande y "con Mercado Pago" va abajo, chico.

## Consecuencias

- Cambiar un SKU en el ERP obliga a cambiarlo en `products.json`; si no, el
  producto queda en "Consultar precio" (y aparece en el `console.warn`).
- Un producto nuevo necesita existir en el ERP con el mismo SKU antes de tener
  precio en el sitio.
- Si el ERP está caído, la tienda se ve pero no vende: todo pasa a "Consultar
  precio".
- Las llamadas al backend siguen [`llamadas-al-backend.md`](../standards/llamadas-al-backend.md).
- Un cambio en el contrato se decide en los dos repos (este ADR y el ADR-025).

### Camino 2

En una etapa posterior del ERP, la ficha de la tienda (nombre, descripción,
fotos, categoría) pasa al ERP y `products.json` desaparece. Este contrato se
amplía con esos campos y la unión por SKU deja de ser un dato a mantener a mano.

## Alternativas rechazadas

| Alternativa                                  | Razón de rechazo                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------ |
| Seguir copiando precios de ML al JSON        | El precio de la tienda es el del local, no el de ML; sin stock real            |
| Unir por id de Mercado Libre                 | Obliga a publicar en ML todo lo que se vende en la tienda                      |
| Mostrar el `price` del JSON si el ERP falla  | El usuario dijo que no lo va a mantener: mostraría precios viejos (2026-10-28) |
| Precios en el build (sin llamada en runtime) | Stock y precio quedarían viejos hasta el próximo deploy                        |
