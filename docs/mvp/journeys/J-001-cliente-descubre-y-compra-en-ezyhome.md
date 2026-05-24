---
journey_id: J-001
title: Cliente descubre y compra en EzyHome
actor: Visitante nuevo (entusiasta de domótica o comprador por seguridad)
actor_role: Cliente potencial
trigger: |
  Ve publicidad de EzyHome en Instagram o encuentra un producto en Mercado Libre.
  La poca oferta de domótica en el mercado y la curiosidad sobre los productos lo lleva a hacer click.
outcome: |
  EzyHome recibe el pedido por WhatsApp con los productos seleccionados y confirma
  la venta manualmente: monto total con envío, datos de pago (MercadoPago) y fecha
  estimada de entrega. La venta queda registrada en la app existente de EzyHome.
status: draft
captured_at: 2026-05-24T00:00:00Z
captured_by: SME (dueño del negocio)
sources: [interactive]
---

# J-001 — Cliente descubre y compra en EzyHome

## Actor

Un adulto de entre 24 y 60 años, curioso o entusiasta de la domótica, o alguien
que busca mejorar la seguridad del hogar con detectores de gas, humo o monóxido de
carbono. Navega principalmente desde el celular. Lo que lo hace confiar (o no) en
una tienda que no conoce es la interfaz: necesita ver algo pulido y serio — no una
tienda improvisada.

## Trigger

Estaba en Instagram y le apareció publicidad de EzyHome, o navegaba en Mercado
Libre y encontró un producto. Lo que lo hace hacer click es la curiosidad por la
domótica (mercado poco saturado) y las posibilidades que ofrecen los productos.

## Outcome

El cliente envía su selección por WhatsApp. EzyHome responde manualmente
confirmando: productos seleccionados, monto total con envío, datos de transferencia
(MercadoPago) y fecha estimada de entrega. La venta queda registrada en la app
existente de EzyHome (futura integración automática).

## Steps

1. Entra a EzyHome desde Instagram o Mercado Libre (celular).
2. Ve la home: ofertas destacadas, más vendidos, productos interesantes.
3. Hace click en una sección de interés o navega libremente.
4. Ve cards con imagen y título de producto.
5. Hace click en un producto que le llama la atención.
6. Lee la descripción del producto.
7. Selecciona la cantidad deseada.
8. Agrega el producto al carrito.
9. Repite pasos 4–8 para otros productos si desea.
10. Hace click en "Comprar" desde el carrito.
11. Se abre WhatsApp con un mensaje pre-armado con su selección.
12. Envía el mensaje a EzyHome.
13. EzyHome responde con precio total, datos de pago y fecha estimada de entrega.

## Failure modes

- **Carrito perdido:** El cliente navega a otro sitio, vuelve y el carrito está
  vacío — genera frustración y abandono. El carrito debe persistir (localStorage).
- **Respuesta lenta en WhatsApp:** EzyHome no está disponible en ese momento para
  cotizar el envío (Andreani / Correo Argentino) y confirmar. El cliente pierde
  interés o desconfía.
- **Falta de confianza visual:** Si la página no transmite seriedad desde los
  primeros segundos, el cliente cierra antes de explorar productos.

## Tools / Systems touched

- Instagram (origen de tráfico)
- Mercado Libre (origen de tráfico alternativo)
- Web de EzyHome (navegación y carrito)
- WhatsApp (cierre de venta)
- MercadoPago (transferencia de pago del cliente)
- Andreani / Correo Argentino (cotización de envío, lado EzyHome)
- App existente de EzyHome (registro manual de la venta, futura integración)

## Emotional journey

Not captured.

## Open questions

- ¿Cuánto tiempo típico tarda EzyHome en responder el WhatsApp? ¿Hay horario de
  atención que deba mostrarse en la página?
- ¿Los precios de envío son fijos o variables por zona? Afecta si se puede mostrar
  un estimado antes del cierre por WhatsApp.
- ¿La integración con la app existente es prioridad para v2?
