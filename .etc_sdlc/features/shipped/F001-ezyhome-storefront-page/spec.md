# PRD: EzyHome Storefront Page

## Summary

EzyHome es una tienda online de domótica para el mercado argentino. El problema central es que la tienda actual (Tienda Nube free) no genera confianza ni transmite profesionalismo — y el tráfico llega principalmente de Instagram y Mercado Libre en mobile, donde la primera impresión es todo.

Esta feature es la tienda completa en v1: catálogo de productos con categorías (iluminación inteligente, automatización, seguridad), cards con imagen/título/precio, detalle de producto, carrito persistente entre sesiones, checkout vía WhatsApp (pre-compone mensaje en un tap), y un blog informativo sobre domótica publicado por el dueño.

La entrega incluye el sitio React + TypeScript + Tailwind CSS con la paleta EzyHome, dockerizado con multi-stage build (nginx), listo para deployar en AWS EC2. El objetivo de negocio concreto es convertir visitantes que hoy rebotan por falta de confianza en clientes que envían un pedido por WhatsApp.

---

## Scope

### In Scope

- Home page con secciones: Hero, Más vendidos, Ofertas, Categorías, CTA a WhatsApp
- Catálogo de productos con filtro por categoría
- Card de producto: imagen, título, precio, botón "Agregar al carrito"
- Detalle de producto: galería de imágenes, descripción, precio, selector de cantidad, botón agregar al carrito
- Carrito persistente (localStorage): ver/editar items, cantidades, subtotal
- Checkout vía WhatsApp: botón genera URL `wa.me/{NUMERO}?text=...` con pedido pre-formateado
- Blog: listado de artículos y vista de artículo individual (Markdown estático, sin CMS)
- Paleta EzyHome completa en Tailwind tokens (colores, tipografía Inter/Geist Mono)
- Diseño mobile-first (360px+), responsive hasta desktop
- Dockerización: `Dockerfile` multi-stage (Node build + nginx serve) + `docker-compose.yml`
- Deploy target: AWS EC2

### Out of Scope

- Login / cuentas de usuario
- Panel de administración de productos o blog (catálogo y artículos son archivos JSON/Markdown editados a mano)
- Pasarela de pago integrada (MercadoPago API, Stripe, etc.)
- Múltiples idiomas
- Blog con categorías, tags o sistema de comentarios
- Integración automática con la app existente del dueño (futura v2)
- SEO avanzado (Open Graph, sitemap XML, structured data) — básico OK, avanzado v2
- Sistema de notificaciones por email al comprador

---

## Requirements

### BR-001: Catálogo de productos

El sistema debe renderizar un catálogo de productos filtrable por categoría. Cada producto tiene: `id`, `name`, `description`, `price`, `images[]`, `category`, `isBestseller`, `isOnSale`, `originalPrice?`. Los datos se leen de un archivo JSON estático en `src/data/products.json`.

### BR-002: Card de producto

Cada card muestra imagen principal, nombre del producto, precio (y precio tachado si `isOnSale`), y botón "Agregar al carrito". Al hacer click en la card (no en el botón) navega al detalle del producto.

### BR-003: Detalle de producto

La página de detalle muestra galería de imágenes (mínimo 1), nombre, descripción completa, precio, selector de cantidad (mínimo 1), y botón "Agregar al carrito". Debe tener URL propia (`/productos/:id`).

### BR-004: Carrito persistente

El carrito se almacena en `localStorage` bajo la clave `ezyhome_cart`. Persiste entre sesiones. Nunca se vacía sin acción explícita del usuario. Soporta múltiples productos con cantidades distintas y muestra subtotal.

### BR-005: Checkout vía WhatsApp

El botón "Comprar por WhatsApp" genera una URL `https://wa.me/{WHATSAPP_NUMBER}?text={mensajeEncoded}`. El mensaje pre-formateado lista cada producto (nombre, cantidad, precio unitario) y el subtotal. `WHATSAPP_NUMBER` se configura via variable de entorno `VITE_WHATSAPP_NUMBER`.

### BR-006: Blog informativo

El blog lista artículos del dueño sobre domótica. Cada artículo es un archivo Markdown en `src/data/blog/`. Metadatos (título, fecha, imagen destacada, slug) en un archivo de índice `src/data/blog/index.json`. Listado en `/blog`, artículo individual en `/blog/:slug`.

### BR-007: Paleta EzyHome

Todos los tokens de diseño de EzyHome deben estar en `tailwind.config.ts`: Background `#f4f7f9`, Foreground `#1e2433`, Card `#ffffff`, Muted `#eef1f4`, Muted foreground `#6b7280`, Border `#e2e8ef`, Primary `#4a9e96`, Primary foreground `#ffffff`, Sidebar bg `#242c3d`, Sidebar foreground `#e8ecf0`, Sidebar accent `#2e3a50`, Sidebar border `#333d54`, Success `#4caf86`, Warning `#d4a017`, Warning foreground `#7a5a00`, Destructive `#e53935`. Tipografía: Inter (UI), Geist Mono (SKUs/IDs).

### BR-008: Mobile-first y performance

El sitio debe funcionar correctamente desde 360px de ancho. Imágenes optimizadas (lazy load, formato WebP cuando sea posible). LCP < 2.5s en conexión 4G. Tap targets ≥ 44px.

### BR-009: Dockerización

El repositorio debe incluir un `Dockerfile` multi-stage (Stage 1: `node:20-alpine` build con `pnpm build`; Stage 2: `nginx:stable-alpine` sirve `dist/`) y un `docker-compose.yml` para levantar el sitio localmente y en producción. La configuración nginx debe manejar SPA routing (`try_files $uri /index.html`) y cache headers apropiados.

---

## Acceptance Criteria

1. El catálogo renderiza todos los productos de `src/data/products.json`; seleccionar una categoría filtra la vista y muestra solo esos productos.
   *As visitor, navigate from the home page to /catalog, click a category filter chip, and see only products from that category rendered in the grid.*

2. Cada card muestra imagen, nombre, precio y badge de descuento cuando `isOnSale = true`; "Agregar al carrito" añade el producto sin navegar fuera de la página.
   *As visitor, navigate from the catalog to a product card, click "Agregar al carrito", and see the cart icon update with the new item count without leaving the catalog page.*

3. La URL `/productos/:id` renderiza detalle con galería, descripción, selector de cantidad (mínimo 1) y botón agregar; un ID inexistente muestra 404.
   *As visitor, navigate from a product card to /productos/:id, browse the image gallery, select a quantity, click "Agregar al carrito", and return to browsing with the item in the cart.*

4. Al cerrar y reabrir el navegador, los items del carrito persisten tal como se dejaron; el subtotal refleja `cantidad × precio` por item.
   *As visitor, navigate to the cart after closing and reopening the browser, and see the same products and quantities as when the session ended.*

5. El botón "Comprar por WhatsApp" genera URL `wa.me/{VITE_WHATSAPP_NUMBER}?text=...` con lista de productos, cantidades y subtotal; abre WhatsApp en un tap.
   *As visitor, navigate from the cart to the "Comprar por WhatsApp" button, tap it, and see WhatsApp open with a pre-formatted message listing all products, quantities, and subtotal ready to send.*

6. `/blog` lista artículos con título, fecha e imagen destacada; `/blog/:slug` renderiza el Markdown del artículo correspondiente.
   *As visitor, navigate from the main menu to /blog, see a list of articles with title, date and cover image, click one, and read the full article at /blog/:slug.*

7. Todos los colores del sitio usan tokens de `tailwind.config.ts`; ningún hex hardcodeado en componentes.
   `surface_status: backend_only`

8. El sitio funciona en viewport de 360px sin layout roto; Lighthouse mobile Performance ≥ 80.
   *As visitor on a 360px mobile device, navigate through the home, catalog, product detail, and cart pages without any horizontal scroll, broken layout, or tap targets smaller than 44px.*

9. `docker compose up` levanta el sitio en `http://localhost:3000`; rutas SPA funcionan en recarga directa (nginx `try_files`).
   `surface_status: backend_only`

---

## Edge Cases

1. **Carrito vacío en checkout**: si el usuario hace click en "Comprar por WhatsApp" con carrito vacío, el botón está deshabilitado o muestra un mensaje "Agregá productos al carrito primero".
2. **Producto sin imagen**: si `images[]` está vacío, se muestra un placeholder con el logo de EzyHome en lugar de imagen rota.
3. **`localStorage` lleno o bloqueado**: si `setItem` lanza una excepción (private browsing, storage lleno), el carrito funciona en memoria para la sesión pero no persiste; se muestra un aviso discreto.
4. **ID de producto inválido**: `/productos/id-inexistente` renderiza la página 404 con link de vuelta al catálogo.
5. **Artículo de blog no encontrado**: `/blog/slug-inexistente` renderiza la página 404.
6. **`VITE_WHATSAPP_NUMBER` no configurado**: el botón de WhatsApp muestra un error claro en desarrollo; en producción no debe quedar vacío (validación en build o documentación explícita en `.env.example`).
7. **Cantidad = 0 en carrito**: no se puede reducir la cantidad de un item por debajo de 1; para eliminar se usa un botón de eliminar explícito.
8. **Imagen de artículo de blog faltante**: si `image` en el índice del blog es null, el card del artículo renderiza sin imagen; el layout no se rompe.
9. **Recarga directa en ruta SPA**: recargar `/productos/123`, `/blog/mi-articulo` o `/carrito` en producción devuelve la app (nginx `try_files`), no un 404 de servidor.

---

## Research Notes

**Codebase:** React 18 + TypeScript + Vite + Tailwind CSS, feature-based structure con `src/features/catalog/` y `src/features/cart/` scaffoldeados. React Router DOM 6 en lugar. Vitest + Testing Library configurado.

**WhatsApp checkout:** URL estándar `https://wa.me/{NUMERO}?text={encodeURIComponent(mensaje)}`. Conversión 5–15% documentada vs 1–4% de e-commerce tradicional. Sin costo de API.

**Cart persistence:** `useState` + `useEffect` + `localStorage` con `JSON.stringify/parse` + try-catch. Patrón React estándar para SPA sin backend.

**Mobile conversion:** Trust signals en primer viewport aumentan conversión 22%+. LCP < 2.5s crítico en 4G. Tap targets ≥ 44px. Average mobile conversion: 2.9%; target EzyHome: ≥ 3%.

**Docker:** Multi-stage build Node 20 Alpine (build) + nginx:stable-alpine (serve). `try_files $uri /index.html` para SPA routing. Cache headers: assets hashed → immutable, index.html → no-cache.

**Journey ref:** J-001 — Cliente descubre y compra en EzyHome.
