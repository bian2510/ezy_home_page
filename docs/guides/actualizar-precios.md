# Precios y stock: vienen del ERP

**Desde 2026-10-28 el precio y el stock que ve el cliente salen del ERP de
EzyHome**, no de este repo (ADR-025 del ERP, camino 1). Ya no hay rutina mensual
de precios ni ofertas.

---

## Cómo funciona

- Cada producto de `src/data/products.json` tiene un **`sku`**, que tiene que ser
  **igual al SKU del producto en el ERP** (mayúsculas y espacios alrededor no
  importan).
- Al cargar el sitio, `PricingProvider` (`src/features/pricing/`) pide una sola
  vez al ERP el precio y el stock de todos los SKU activos:
  `GET https://ezyhome.app/api/store/products?skus=...` con la clave
  `VITE_STORE_API_KEY` (secret del repo, ver [`deploy-y-ci.md`](./deploy-y-ci.md)).
- El ERP devuelve dos precios: **con Mercado Pago** (precio del local + recargo,
  redondeado a $100) y **con transferencia** (precio del local − descuento). Los
  dos se ajustan en Configuración del ERP, no acá.
- La card y el detalle muestran el precio con Mercado Pago y, debajo, "$X con
  transferencia" cuando es menor. El carrito y el mensaje de WhatsApp usan esos
  mismos precios.

| Qué devuelve el ERP para el SKU     | Qué ve el cliente                                       |
| ----------------------------------- | ------------------------------------------------------- |
| Precio y stock                      | Precio y "Agregar al carrito"                           |
| Precio sin stock                    | Precio, "Sin stock" y "Consultar por WhatsApp"          |
| Nada (SKU desconocido o sin precio) | "Consultar precio" y "Consultar por WhatsApp"           |
| El ERP no responde / sin clave      | "Consultar precio" en todos los productos               |
| Todavía cargando                    | Un skeleton en lugar del precio; el botón deshabilitado |

**`products.json` no tiene precios.** El JSON-LD de la página de detalle (lo que
lee Google) publica la oferta con el precio y el stock del ERP; si el ERP no dio
precio, el producto sale sin `offers` (nunca con un precio viejo).

## Si cambiás un SKU en el ERP

Cambialo también en `products.json`. Si no, el ERP no devuelve ese producto y
el sitio lo muestra como "Consultar precio". Para detectarlo, el sitio escribe
en la consola del navegador:

```
[precios] El ERP no devolvió estos SKU: ...
```

Cuando exista la ficha de tienda en el ERP (camino 2) el JSON desaparece y esto
deja de hacer falta.

---

## Antes (ya no existe)

Hasta 2026-10-28 los precios se copiaban del export de Mercado Libre con
`pnpm precios:informe` / `pnpm precios:aplicar`, con ofertas. Ese script se
borró: el precio de venta viene del ERP y la visibilidad (`active`) se maneja a
mano en el JSON.
