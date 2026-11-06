# EzyHome — Domain Briefing

<!-- This file is the most important file in the repository. It answers every
     question an agent or engineer should ask before touching code. All
     architecture, implementation, and prioritization decisions trace back here.
     Write every section as prose a new hire could read in 10 minutes and leave
     knowing what the company does, why it exists, and what must not be broken. -->

---

## Domain

EzyHome opera en el rubro de domótica y electrónica para el hogar en Argentina
como tienda online minorista de dispositivos inteligentes. Su misión es masificar
la domótica haciéndola accesible, simple y confiable para hogares argentinos de
todos los perfiles.

---

## Core Problem

La domótica en Argentina es percibida como cara, compleja y exclusiva para
personas tecnológicas. La mayoría de los hogares no accede a soluciones de hogar
inteligente porque no saben cómo empezar, los precios parecen prohibitivos o los
canales de venta no generan confianza. EzyHome existe para cerrar esa brecha: una
tienda online con una cara profesional y accesible que demuestre que cualquier
persona —joven, adulto mayor, o cuidador de familia— puede adoptar la domótica
sin ser un experto.

---

## How EzyHome Makes Money

EzyHome genera ingresos por venta directa de productos de domótica. Hay dos
caminos de compra:

- **Retiro en el local, autoservicio:** el cliente arma el carrito, completa sus
  datos en `/checkout` y el ERP de EzyHome crea el pedido con sus precios. El
  cliente paga por transferencia bancaria (a la cuenta que muestra el pedido) o
  con Mercado Pago (el ERP genera el cobro y el sitio redirige), y retira en el
  local (ADR-006).
- **Envío o consulta, asistido:** el cliente manda el carrito por WhatsApp y
  EzyHome cierra la venta manualmente, cotiza el envío (Andreani / Correo
  Argentino) y cobra. Los envíos siguen por este camino hasta que haya cotizador.

---

## What EzyHome Does

EzyHome presenta un catálogo de productos de domótica organizado en categorías
(iluminación inteligente, automatización del hogar, seguridad y detectores). El
visitante navega la tienda desde su celular —principal canal de entrada vía
Instagram y Mercado Libre— ve cards de producto con imagen, título y precio, y
puede ingresar al detalle de cada uno para leer la descripción y seleccionar
cantidad.

El carrito persiste entre sesiones (localStorage) para evitar que un cliente
pierda su selección al salir y volver. El precio y el stock de cada producto
vienen del ERP por SKU (ADR-005); el carrito no deja sumar más unidades que el
stock disponible.

Cuando el visitante decide comprar y todos los productos tienen precio y stock
del ERP, puede comprar con retiro en el local: carga nombre, WhatsApp, email y
DNI, acepta el aviso de privacidad (Ley 25.326) y elige transferencia o Mercado
Pago. El sitio lo lleva a `/pedido/:token`, que muestra el número, el total, cómo
pagar, el vencimiento y dónde y cuándo retirar. Si quiere envío o algún producto
no tiene precio, se pre-compone un mensaje de WhatsApp con el carrito y EzyHome
responde manualmente con el total y los datos de pago.

Además de la tienda, EzyHome publica contenido educativo sobre domótica en un
blog informativo — solo el dueño publica, los visitantes solo leen. El objetivo
es reducir la barrera de entrada mostrando casos de uso reales y demostraciones
de productos.

Actores: visitante (cliente potencial, adulto 24–60 años que llega de Instagram
o Mercado Libre), EzyHome (operador que publica contenido, entrega los pedidos
de retiro y cierra por WhatsApp las ventas con envío) y el ERP de EzyHome (repo
`bian2510/ezy_home_app`: precio, stock, pedidos y cobro con Mercado Pago).

---

## Operational & Regulatory Constraints

- **Mobile-first obligatorio**: la mayoría de visitantes llegan desde Instagram o
  Mercado Libre en celular. Cualquier feature que no funcione bien en mobile de
  360px+ es inaceptable.
- **Medios de pago: transferencia bancaria y Mercado Pago**. El cobro con
  Mercado Pago lo hace el ERP; el sitio solo redirige al link que el ERP genera
  y está detrás de `VITE_MERCADOPAGO_ENABLED` (ADR-006). No se integran tarjetas
  ni efectivo directamente en la web.
- **El ERP manda**: precio, stock y pedidos son del ERP. El sitio nunca muestra
  un precio propio ni manda precios al crear un pedido (ADR-005, ADR-006).
- **Transportistas argentinos**: cotización de envío vía Andreani y/o Correo
  Argentino, fuera del flujo automatizado; los envíos se cierran por WhatsApp.
- **Sin regulaciones especiales**: el rubro es electrónica de consumo; no aplican
  HIPAA, PCI DSS ni regímenes regulatorios especiales en v1.
- **Carrito persistente**: requisito de negocio — el carrito nunca puede perderse
  entre sesiones sin acción explícita del usuario.

---

## Product Core

- **Producto**: dispositivo de domótica disponible para la venta (ej. foco
  inteligente, detector de gas, sensor de movimiento). Tiene nombre, descripción,
  precio, imágenes y categoría.
- **Categoría**: agrupación temática de productos (iluminación, seguridad,
  automatización). Es el eje de navegación del catálogo.
- **Carrito (Cart)**: colección de productos con cantidades que un visitante
  seleccionó. Persiste entre sesiones. No requiere cuenta de usuario.
- **Pedido (Order)**: compra creada en el ERP desde `/checkout`, con retiro en
  el local. Tiene número, token (para `/pedido/:token`), medio de pago
  (`transfer` o `mercado_pago`), total, vencimiento y estado (`pending_payment`,
  `paid`, `expired`, `canceled`). Los precios los pone el ERP (ADR-006).
- **Comprador (Buyer)**: nombre y apellido, WhatsApp (10 números), email y DNI
  del pedido. El DNI hace falta para facturar y para saber quién retira.
- **Mensaje WhatsApp**: el carrito como texto pre-formateado, enviado en un tap.
  Es el camino para envíos, consultas y productos sin precio del ERP.
- **Artículo de blog (Post)**: contenido educativo sobre domótica publicado por
  el dueño. Solo lectura para visitantes. Gestionado como archivos estáticos en
  v1.

---

## What EzyHome Is Not

- No es una tienda generalista de electrónica — foco exclusivo en domótica.
- No procesa pagos directamente: la transferencia la confirma EzyHome y el
  cobro con Mercado Pago lo hace el ERP (ADR-025 del ERP). El sitio no maneja
  credenciales de pago.
- No tiene sistema de cuentas de usuario ni login en v1.
- No tiene panel de administración de productos: la vitrina (nombre, fotos,
  descripción, categoría) es estática en `products.json` y el precio y el stock
  vienen del ERP de EzyHome por SKU (ADR-005). El sitio solo lee del ERP; no
  escribe.
- No es una plataforma de publicación multi-autor — solo el dueño publica
  contenido en el blog.
- No soporta múltiples idiomas — español argentino únicamente.
- No es una red social ni foro de comunidad.

---

## Risk Posture

- **Riesgo de confianza (CRÍTICO)**: si la página no transmite profesionalismo
  desde el primer viewport, el visitante que llegó de Instagram o Mercado Libre
  cierra inmediatamente. Este es el riesgo de conversión más alto — no técnico,
  sino visual.
- **Carrito perdido (ALTO)**: si el carrito no persiste entre sesiones, el cliente
  pierde su selección y abandona. Pérdida directa de venta.
- **Latencia de respuesta WhatsApp (MEDIO)**: si EzyHome no responde rápido, el
  cliente pierde interés. La web debe comunicar claramente el horario de atención
  o tiempo de respuesta esperado.
- **Incertidumbre de costo de envío (MEDIO)**: quien quiere envío no sabe el
  total real hasta recibir confirmación por WhatsApp. Puede generar abandono.
- **ERP caído (ALTO)**: sin respuesta del ERP la tienda se ve pero no vende:
  todo pasa a "Consultar precio" por WhatsApp (ADR-005).

---

## Design Implications

- Porque el tráfico es mayoritariamente mobile (Instagram → celular), el sistema
  debe ser mobile-first con breakpoints desde 360px y performance optimizada
  (LCP < 2.5s en 4G).
- Porque la confianza visual es el riesgo #1, cada página debe incluir señales de
  profesionalismo en el primer viewport: branding consistente, imágenes de
  producto de calidad, tipografía clara (Inter / Geist Mono para SKUs), y paleta
  de marca teal (#4a9e96) aplicada coherentemente.
- Porque el carrito no puede perderse, la persistencia en localStorage es
  obligatoria — ninguna navegación ni cierre de tab puede vaciar el carrito sin
  acción explícita del usuario.
- Porque los envíos y las consultas cierran vía WhatsApp, ese botón debe
  pre-componer el mensaje en un tap; no puede requerir copiar y pegar.
- Porque el ERP es la fuente de precio, stock y pedidos, toda llamada de red
  vive en `src/features/<feature>/*Api.ts` y la UI siempre tiene un estado para
  cuando el ERP falla (ver `docs/standards/llamadas-al-backend.md`).
- Porque el dueño publica contenido de blog sin panel CMS, los artículos se
  gestionan como archivos estáticos (Markdown o JSON) — no se construye un
  backend de contenido en v1.
- Porque el sitio se integra con el ERP, las entidades de Producto, Carrito y
  Pedido se modelan con contratos de datos limpios (ADR-005, ADR-006).

---

_This document is the source of truth for domain understanding. Any implementation
decision that contradicts this document must be flagged and resolved before proceeding._
