# Deuda técnica

Cosas que decidimos dejar para después. Cada entrada dice por qué no se hizo y
qué la volvería urgente. Cuando se resuelve, se borra de acá y el PR que la
cierra lo menciona.

---

## Interruptor de Mercado Pago en el ERP

**Anotado:** 2026-11-06 · **Prioridad:** baja

Desde #42 el sitio ofrece Mercado Pago siempre (se sacó
`VITE_MERCADOPAGO_ENABLED`). Si hay que dejar de ofrecerlo (problema con la
cuenta de MP, comisiones, MP caído varios días), hoy hay que revertir #42 y
redesplegar. Si MP falla al crear un cobro, el sitio ya ofrece pasar a
transferencia o WhatsApp (ADR-006), así que no hace falta para el día a día.

**Por qué no ahora:** Mercado Pago cobra bien en producción y revertir #42 tarda
minutos. El interruptor es una comodidad, no un arreglo.

**Se vuelve urgente si:** hay que apagar Mercado Pago más de una vez.

**Propuesta de contrato** (no acordada todavía; cambia ADR-005, ADR-006 y el
ADR-025 del ERP):

- ERP: opción por empresa `store_mercado_pago_enabled` (prendida por defecto)
  en Configuración › Tienda online.
- `GET /api/store/products` suma `"payment_methods": ["transfer", "mercado_pago"]`;
  con MP apagado, solo `["transfer"]`.
- `POST /api/store/orders` con `mercado_pago` y MP apagado: **422** con `detail`.
- Sitio: sin `mercado_pago` en `payment_methods`, un solo precio
  (transferencia) y checkout solo con transferencia. Si el campo no viene (ERP
  viejo), se toma como prendido, así el sitio puede salir antes que el ERP.

---

## Precio que ve Google (JSON-LD)

**Anotado:** 2026-11-06 · **Prioridad:** baja

El JSON-LD de cada producto publica el precio con Mercado Pago (el más alto),
mientras que en la página el grande es el de transferencia. Producción ya lo
hacía así antes de #42. Falta decidir cuál debe ver Google.

---

## Limpieza pendiente

- **`.env.example`:** sacar `VITE_MERCADOPAGO_ENABLED` (líneas 28-32); ya no lo
  usa nada desde #42.
- **Secret del repo:** borrar `VITE_MERCADOPAGO_ENABLED`
  (`gh secret delete VITE_MERCADOPAGO_ENABLED`); el CI ya no lo pasa al build.
- **PRs de dependabot abiertos desde mayo (#7–#19):** revisarlos o cerrarlos.
  Varios son saltos grandes (tailwind 3→4, jsdom 25→29, commitlint 19→21).
