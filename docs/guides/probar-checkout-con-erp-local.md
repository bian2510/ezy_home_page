# Probar el checkout contra el ERP local

Para ver el checkout (transferencia y Mercado Pago) con pedidos reales del ERP
en tu máquina, sin tocar producción. Los tests no necesitan nada de esto: mockean
`fetch` ([`testing.md`](../standards/testing.md)).

## 1. El ERP local (repo `ezy_home_app`)

- Levantado en `http://localhost:4000` (`docker compose up`). En desarrollo el
  ERP acepta el origen `http://localhost:5173` (CORS) y arma la vuelta de
  Mercado Pago a `http://localhost:5173/pedido/<token>`.
- La empresa con la tienda prendida (`Accounts.enable_store/1`) y una clave de
  la API de la tienda (`Accounts.create_api_key(<company_id>, label:
"ezy_home_page")`; el texto de la clave se ve una sola vez). Ver
  `docs/contexts/store.md` del ERP.
- En **Configuración › Tienda online**: alias o CBU, titular y retiro (para
  transferencia) y, para Mercado Pago, la cuenta conectada con credenciales de
  **prueba** y "Probar conexión" bien. Sin eso el ERP responde 422 ("Mercado
  Pago no está disponible") y el checkout muestra ese mensaje.
- Productos activos con el mismo SKU que `src/data/products.json`, con precio y
  stock.

## 2. El sitio

Crear `.env.local` en la raíz (lo ignora git; **nunca** commitearlo):

```bash
VITE_STORE_API_URL=http://localhost:4000
VITE_STORE_API_KEY=<la clave que dio el ERP local>
VITE_MERCADOPAGO_ENABLED=true
VITE_WHATSAPP_NUMBER=5491112345678
```

```bash
pnpm dev   # http://localhost:5173 (tiene que ser ese puerto: es el que permite el ERP)
```

## 3. Qué probar

| Caso                         | Cómo                                                                                                        | Qué se ve                                                          |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Transferencia                | Carrito → checkout → Transferencia                                                                          | `/pedido/:token` con la cuenta, el concepto y el vencimiento       |
| Mercado Pago                 | Checkout → Mercado Pago                                                                                     | "Abriendo Mercado Pago…" y el checkout de MP (usuario de prueba)   |
| MP no crea el cobro          | No se fuerza fácil a mano (desconectar la cuenta da 422 al crear); lo cubre `OrderPageMercadoPago.test.tsx` | "No pudimos abrir Mercado Pago…" y **Pagar por transferencia**     |
| Vuelta con pago              | Pagar con una tarjeta de prueba aprobada                                                                    | "Recibimos tu pago" y, cuando llega el aviso, "Pago confirmado"    |
| Vuelta con error / pendiente | Abrir `/pedido/<token>?resultado=error` o `?resultado=pendiente`                                            | "El pago no se completó" con **Probar de nuevo** / "pendiente"     |
| Volver más tarde             | Abrir `/pedido/<token>` de un pedido de MP pendiente                                                        | **Ir a pagar**, sin redirigir solo y sin la cuenta para transferir |

**El aviso de pago no llega a localhost:** Mercado Pago no puede llamar al ERP
local sin un túnel (`ngrok` o similar) configurado como URL de avisos en
Configuración › Tienda online. Sin túnel, la vuelta con `ok` termina en "Estamos
confirmando tu pago con Mercado Pago" y el pedido queda pendiente hasta que el
ERP lo consulte al vencer (etapa 4 §6 del ERP).
