# Release Notes — F001-ezyhome-storefront-page

## Phases

### Phase 0

- Source: `build/phase-0/completion-report.md`
- (report missing)

### Phase 1

- Source: `build/phase-1/completion-report.md`
- PRD: EzyHome Storefront Page (F001)
- Acceptance Criteria: 14 passed, 0 failed (see `build/phase-1/completion-report.md`)
  - [x] CartPage at /carrito renders CartItem rows showing product name, quantity, unit price, line subtotal formatted ARS. Shows cart total. Has decrease/increase buttons clamped min 1 and explicit remove button per item. Empty cart shows message and link to /catalogo.
  - [x] CartPage includes Comprar por WhatsApp button calling buildWhatsAppMessage. Button disabled when cart empty. If storageAvailable false shows discreet banner.
  - [x] Vitest: empty cart shows message; items render with correct subtotal; quantity cannot go below 1.
  - [x] CatalogPage reads products.json and renders in responsive grid (1 col base 360px, 2 at sm, 3 at md). Passes each product to ProductCard.
  - [x] CategoryFilter renders chip buttons per unique category plus Todos. Clicking chip filters grid to that category. Clicking Todos shows all. Active chip uses primary token styling.
  - [x] useCatalog hook returns filtered array, selectedCategory (null means all), setCategory function, categories string array. Vitest: default shows all; filter works; null resets to all.
  - [x] ProductCard renders: product image first in images[] with loading lazy, or placeholder text when images empty. Shows name and price ARS. isOnSale shows originalPrice struck-through and Oferta badge. isBestseller shows Mas vendido badge.
  - [x] Clicking card body navigates to /productos/:id. Agregar al carrito button calls addItem without navigating. Button has min-h-11 for 44px tap target. Badge uses warning token for sale, success token for bestseller.
  - [x] Vitest: name and price render; sale badge visible when isOnSale; add-to-cart does not trigger navigation; empty images shows placeholder without broken img.
  - [x] useBlogPost(slug string) hook uses import.meta.glob targeting src/data/blog/*.md with query ?raw and eager false. Returns {content: string|null, meta: BlogMeta|null, notFound: boolean, loading: boolean}. Looks up slug in index.json; if not found returns notFound true immediately. If found dynamically imports the .md file and sets content to the raw string.
  - [x] Vitest tests: known slug eventually resolves content and meta with notFound false; unknown slug returns notFound true synchronously.
  - [x] ProductDetailPage at /productos/:id finds product by id in products.json. Renders: image gallery with thumbnails when images.length > 1 or placeholder when empty; name; full description; price ARS with originalPrice struck-through if isOnSale; QuantitySelector starting at 1; Agregar al carrito button calling addItem with selected quantity.
  - [x] Invalid id renders 404 message with link to /catalogo.
  - [x] QuantitySelector: current quantity shown, decrement disabled at 1, increment available. All buttons min-h-11. Vitest: renders product details; invalid id shows 404; quantity decrement disabled at 1.

### Phase 2

- Source: `build/phase-2/completion-report.md`
- PRD: EzyHome Storefront Page (F001)
- Acceptance Criteria: 9 passed, 0 failed (see `build/phase-2/completion-report.md`)
  - [x] BlogListPage at /blog reads index.json and renders BlogCard per article. Shows title and date formatted es-AR locale. Clicking card navigates to /blog/:slug.
  - [x] BlogCard shows cover image with loading lazy when image is not null. When image is null renders card without any img element. No broken img, no layout shift.
  - [x] Vitest: articles list renders titles; card with null image has no img element.
  - [x] BlogPostPage at /blog/:slug calls useBlogPost. When content loaded renders title and date above Markdown via ReactMarkdown with remarkGfm. rehypeRaw is NOT used.
  - [x] notFound true renders 404 message with link back to /blog. loading true shows loading indicator.
  - [x] Vitest: renders article title for known slug; renders 404 for unknown slug.
  - [x] HomePage renders: Hero (headline, subheadline, button linking to /catalogo); Mas vendidos (isBestseller products via ProductCard); Ofertas (isOnSale products via ProductCard); Categorias (3 cards linking to /catalogo for iluminacion, automatizacion, seguridad); WhatsApp CTA button using VITE_WHATSAPP_NUMBER.
  - [x] Hero main image if present uses fetchpriority high. Other images use loading lazy. Works at 360px without horizontal scroll.
  - [x] Vitest: hero CTA links to /catalogo; bestseller products render; 3 category cards present.

### Phase 3

- Source: `build/phase-3/completion-report.md`
- PRD: EzyHome Storefront Page (F001)
- Acceptance Criteria: 3 passed, 0 failed (see `build/phase-3/completion-report.md`)
  - [x] App.tsx registers all routes: / (HomePage), /catalogo (CatalogPage), /productos/:id (ProductDetailPage), /carrito (CartPage), /blog (BlogListPage), /blog/:slug (BlogPostPage), * (NotFoundPage).
  - [x] RootLayout wraps Outlet with CartProvider. SiteHeader shows EzyHome logo linking to /, nav links to /catalogo /blog /carrito, cart icon badge showing itemCount hidden when zero. SiteFooter shows business name and links.
  - [x] SiteHeader and SiteFooter use only EzyHome Tailwind tokens. No hex colors. No old scaffold tokens (no bg-brand- bg-surface text-text-). Vitest: cart badge reflects itemCount; nav links render.

### Phase 4

- Source: `build/phase-4/completion-report.md`
- PRD: EzyHome Storefront Page (F001)
- Acceptance Criteria: 3 passed, 0 failed (see `build/phase-4/completion-report.md`)
  - [x] Dockerfile multi-stage: Stage 1 node:20-alpine enables pnpm via corepack enable, copies package files, runs pnpm install --frozen-lockfile, copies src, runs pnpm build. Stage 2 nginx:stable-alpine copies dist from Stage 1 and nginx.conf to default.conf. Runs as non-root user.
  - [x] nginx.conf: try_files $uri /index.html for SPA routing; Cache-Control immutable max-age 31536000 for hashed assets; Cache-Control no-cache for index.html.
  - [x] docker-compose.yml maps port 3000 to container 80, passes VITE_WHATSAPP_NUMBER as build arg. .env.example documents VITE_WHATSAPP_NUMBER with instructions digits only no + prefix.

## Deferred Items

From Phase 1 (`build/phase-1/completion-report.md`):
- (none)

From Phase 2 (`build/phase-2/completion-report.md`):
- (none)

From Phase 3 (`build/phase-3/completion-report.md`):
- (none)

From Phase 4 (`build/phase-4/completion-report.md`):
- (none)

## Known Limitations

From Phase 1 (`build/phase-1/completion-report.md`):
- (none)

From Phase 2 (`build/phase-2/completion-report.md`):
- (none)

From Phase 3 (`build/phase-3/completion-report.md`):
- (none)

From Phase 4 (`build/phase-4/completion-report.md`):
- (none)
