# Gray Areas — Resolved Decisions

## GA-001: Precio visible en cards de catálogo
- **Options:** precio en card vs solo en detalle vs sin precios
- **Decision:** precio visible en la card (imagen, título, precio)
- **Rationale:** best practice de confianza — pricing transparente desde el catálogo aumenta conversión
- **Decided by:** user

## GA-002: Flags de secciones "Más vendidos" y "Ofertas"
- **Options:** flag en JSON del producto vs array manual de IDs vs sección genérica
- **Decision:** campos `isBestseller: boolean` e `isOnSale: boolean` en el objeto producto; también `originalPrice` para mostrar descuento cuando `isOnSale = true`
- **Rationale:** más ergonómico para el dueño editar un solo JSON por producto que mantener arrays de IDs separados
- **Decided by:** user

## GA-003: Estructura del blog
- **Options:** listado plano vs categorías vs tags libres
- **Decision:** listado plano — artículos con título, fecha, imagen destacada y contenido Markdown; sin categorías ni tags en v1
- **Rationale:** más simple de mantener manualmente; categorías pueden agregarse en v2 cuando haya suficiente volumen de contenido
- **Decided by:** user

## GA-004: Persistencia del carrito
- **Options:** localStorage vs sessionStorage vs cookie vs backend
- **Decision:** localStorage con JSON.stringify/parse + try-catch
- **Rationale:** patrón estándar React para SPA sin backend en v1; persiste entre sesiones sin requerir cuenta de usuario
- **Decided by:** research
- **Citation:** https://coreui.io/answers/how-to-persist-state-with-localstorage-in-react/
- **Resolution rationale:** universally-accepted pattern for client-side cart persistence in React SPAs

## GA-005: WhatsApp checkout URL format
- **Options:** wa.me link vs WhatsApp Business API vs terceros
- **Decision:** `https://wa.me/{NUMERO}?text={encodeURIComponent(mensaje)}`
- **Rationale:** sin costo, sin integración de API, un tap desde mobile; conversión 5–15% documentada
- **Decided by:** research
- **Citation:** https://quadlayers.com/how-to-create-a-whatsapp-link-wa-me-with-a-pre-filled-message/
- **Resolution rationale:** official WhatsApp click-to-chat format, no API keys required

## GA-006: Docker deployment strategy
- **Options:** multi-stage build vs single stage vs sin Docker
- **Decision:** multi-stage build — Node 20 Alpine (build) + nginx:stable-alpine (serve)
- **Rationale:** imagen pequeña, sin herramientas de build en producción, nginx óptimo para servir SPA estática; encaja con AWS EC2 existente
- **Decided by:** research
- **Citation:** https://www.buildwithmatija.com/blog/production-react-vite-docker-deployment
- **Resolution rationale:** industry standard for React Vite production containerization; nginx handles SPA routing and cache headers
