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

EzyHome genera ingresos por venta directa de productos de domótica. El proceso de
compra en v1 es asistido: el cliente arma un carrito en la web y envía el pedido
por WhatsApp; EzyHome cierra la venta manualmente, cotiza el envío (Andreani /
Correo Argentino) y recibe el pago por transferencia bancaria o MercadoPago. En
versiones futuras se integrará una pasarela de pago para automatizar el cierre y
reducir la fricción.

---

## What EzyHome Does

EzyHome presenta un catálogo de productos de domótica organizado en categorías
(iluminación inteligente, automatización del hogar, seguridad y detectores). El
visitante navega la tienda desde su celular —principal canal de entrada vía
Instagram y Mercado Libre— ve cards de producto con imagen, título y precio, y
puede ingresar al detalle de cada uno para leer la descripción y seleccionar
cantidad.

El carrito persiste entre sesiones (localStorage) para evitar que un cliente
pierda su selección al salir y volver. Cuando el visitante decide comprar, se
pre-compone un mensaje de WhatsApp con el detalle de su carrito y lo envía a
EzyHome. EzyHome responde manualmente con el total final incluido el envío y los
datos de pago (MercadoPago o transferencia bancaria).

Además de la tienda, EzyHome publica contenido educativo sobre domótica en un
blog informativo — solo el dueño publica, los visitantes solo leen. El objetivo
es reducir la barrera de entrada mostrando casos de uso reales y demostraciones
de productos.

Actores: visitante (cliente potencial, adulto 24–60 años que llega de Instagram
o Mercado Libre), y EzyHome (operador que publica contenido, cierra ventas vía
WhatsApp y registra pedidos en su app interna).

---

## Operational & Regulatory Constraints

- **Mobile-first obligatorio**: la mayoría de visitantes llegan desde Instagram o
  Mercado Libre en celular. Cualquier feature que no funcione bien en mobile de
  360px+ es inaceptable.
- **MercadoPago como método de pago**: único canal de cobro en v1. No se integran
  tarjetas ni efectivo directamente en la web.
- **Transportistas argentinos**: cotización de envío vía Andreani y/o Correo
  Argentino, fuera del flujo automatizado en v1.
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
- **Pedido (Order)**: el carrito convertido en mensaje de WhatsApp enviado a
  EzyHome. Incluye lista de productos, cantidades y datos de contacto del cliente.
- **Mensaje WhatsApp**: representación del pedido como texto pre-formateado para
  ser enviado en un tap desde la app de WhatsApp.
- **Artículo de blog (Post)**: contenido educativo sobre domótica publicado por
  el dueño. Solo lectura para visitantes. Gestionado como archivos estáticos en
  v1.

---

## What EzyHome Is Not

- No es una tienda generalista de electrónica — foco exclusivo en domótica.
- No procesa pagos directamente en v1 — el checkout cierra vía WhatsApp +
  transferencia manual.
- No tiene sistema de cuentas de usuario ni login en v1.
- No tiene panel de administración de productos en v1 (catálogo estático o
  gestionado externamente).
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
- **Incertidumbre de costo de envío (MEDIO)**: el cliente no sabe el total real
  hasta recibir confirmación por WhatsApp. Puede generar abandono post-checkout.

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
- Porque el cierre es vía WhatsApp, el botón de compra debe pre-componer el
  mensaje en un tap; no puede requerir copiar y pegar manualmente.
- Porque el dueño publica contenido de blog sin panel CMS, los artículos se
  gestionan como archivos estáticos (Markdown o JSON) — no se construye un
  backend de contenido en v1.
- Porque la integración futura con la app existente (Resend, ventas) debe ser
  posible, las entidades de Producto, Carrito y Pedido se modelan con contratos
  de datos limpios desde el inicio.

---

_This document is the source of truth for domain understanding. Any implementation
decision that contradicts this document must be flagged and resolved before proceeding._
