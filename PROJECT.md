# EzyHome — Project Orientation

**What this is:** Tienda online de domótica con blog informativo — catálogo de productos con precio y stock del ERP, carrito persistente, compra con retiro en el local (transferencia o Mercado Pago, pedido creado en el ERP) y WhatsApp para envíos y consultas.

**Read order for new agents:**

1. `DOMAIN.md` — qué hace EzyHome y por qué (contexto de negocio, restricciones, implicaciones de diseño)
2. This file — dónde encontrar las cosas en el repo
3. The PRD for your task's bounded context (see `docs/prds/`)
4. `docs/sources/` — investigación que informó los PRDs

---

## Current Phase

**En producción.** Catálogo, carrito, blog, precio y stock desde el ERP (ADR-005) y checkout con pedido en el ERP: transferencia con retiro y Mercado Pago (ADR-006, etapas 3d y 3e) están en `main`.

**En curso:**

- **Rediseño de la UI** en la rama `rediseno-ui`: los PRs del rediseño se mergean ahí y todavía no pasaron a `main`.
- **SEO:** metadatos, sitemap y JSON-LD hechos; faltan Search Console y el prerender (`docs/plans/2026-09-22-seo-organico.md`).

---

## Where Things Live

| What you need                                   | Where to find it                                    |
| ----------------------------------------------- | --------------------------------------------------- |
| Business domain and constraints                 | `DOMAIN.md`                                         |
| Customer journeys                               | `docs/mvp/journeys/`                                |
| Per-bounded-context requirements                | `docs/prds/`                                        |
| Architectural decisions (ADRs)                  | `docs/adrs/` — índice en `docs/standards/README.md` |
| Ground truth research                           | `docs/sources/`                                     |
| Implementation plans (dated)                    | `docs/plans/`                                       |
| Architecture layer map + import rules           | `docs/standards/capas-arquitectura.md`              |
| Where to put a component (ui/ vs feat.)         | `docs/standards/componentes-ui-vs-feature.md`       |
| Feature module structure + index.ts             | `docs/standards/modulos-feature.md`                 |
| State management patterns                       | `docs/standards/gestion-estado.md`                  |
| Images and PDFs per product                     | `docs/standards/assets-estaticos.md`                |
| All engineering standards (index)               | `docs/standards/README.md`                          |
| Code conventions (TS, Tailwind, tests)          | `docs/frontend-conventions.md`                      |
| Component complexity rules (props/lines)        | `docs/standards/reglas-componentes.md`              |
| Where utility functions live                    | `docs/standards/funciones-utils.md`                 |
| Testing patterns (builders, mocks, etc)         | `docs/standards/testing.md`                         |
| Design tokens cheatsheet                        | `docs/standards/tailwind-tokens.md`                 |
| Agent working protocol (detailed)               | `docs/agents.md`                                    |
| How to add a product                            | `docs/guides/agregar-producto.md`                   |
| How to add a PDF manual                         | `docs/guides/agregar-pdf-manual.md`                 |
| How to add a new feature module                 | `docs/guides/agregar-feature.md`                    |
| Cómo se publica el sitio (CI, deploy, rollback) | `docs/guides/deploy-y-ci.md`                        |
| Precios y stock (vienen del ERP por SKU)        | `docs/guides/actualizar-precios.md`                 |
| Llamadas al ERP (`fetch` solo en `*Api.ts`)     | `docs/standards/llamadas-al-backend.md`             |
| Probar el checkout contra el ERP local          | `docs/guides/probar-checkout-con-erp-local.md`      |
| Scripts de operación (bundle, smoke)            | `scripts/`                                          |
| All operational guides (index)                  | `docs/guides/README.md`                             |
| Feature specs (ETC harness)                     | `.etc_sdlc/features/`                               |
| App source                                      | `src/`                                              |
| Tests                                           | `tests/`                                            |

**Anti-fabrication rule:** If an agent needs to make a factual claim about the
business or the system, that claim must cite `DOMAIN.md` or a file in
`docs/sources/`. No invented facts.

---

## Tech Stack Anchors

- **Frontend:** React 18 + TypeScript — `src/`
- **Build tool:** Vite — `vite.config.ts`
- **Styling:** Tailwind CSS + design tokens EzyHome — `tailwind.config.ts`, `src/styles/global.css`
- **Testing:** Vitest + Testing Library — `vitest.config.ts`, `tests/`
- **Linting/Formatting:** ESLint + Prettier — `eslint.config.js`, `.prettierrc.json`
- **CI:** GitHub Actions — `.github/workflows/ci.yml`
- **Local dev:** `pnpm install && pnpm dev` (Node 20+, pnpm 9)
- **Hosting:** Cloudflare Pages (proyecto `ezyhome-storefront`), estático, publicado por el CI en cada push a `main` — `docs/guides/deploy-y-ci.md`. En runtime lee precio y stock del ERP (`https://ezyhome.app/api/store/products`, ADR-005) y crea y consulta pedidos (`/api/store/orders`, ADR-006).
- **Variables de entorno:** `.env.example` y la tabla del README; en producción salen de los secrets de GitHub.
- **Backend:** ERP EzyHome (repo `bian2510/ezy_home_app`). La red solo se usa desde `src/features/<feature>/*Api.ts` (lo exige ESLint), ver `docs/standards/llamadas-al-backend.md`
- **Scripts de operación:** `scripts/` (presupuesto de bundle, smoke test)
- **Email (futuro):** Resend — ya disponible en app existente del dueño

**Key ADRs to read before touching architecture:**

- [`ADR-004`](docs/adrs/ADR-004-arquitectura-frontend-capas.md) — Arquitectura en capas Feature-Sliced Lite (flujo de imports, encapsulamiento por feature)
- [`F001-001`](docs/adrs/F001-001-cart-state-react-context.md) — React Context para carrito (no Zustand)
- [`F001-002`](docs/adrs/F001-002-tailwind-token-remapping.md) — Tokens de diseño EzyHome
- [`F001-003`](docs/adrs/F001-003-blog-static-markdown.md) — Blog estático con Markdown
- [`ADR-005`](docs/adrs/ADR-005-precio-y-stock-desde-el-erp.md) — Precio y stock desde el ERP (contrato de la API, qué se muestra si falla)
- [`ADR-006`](docs/adrs/ADR-006-pedido-por-transferencia-con-retiro.md) — Pedido en el ERP: transferencia con retiro, Mercado Pago, tope por stock

---

## Role Manifests

Agents working in this repo should load context through their role manifest in
`roles/`. Manifests declare which slices of this tree a role consumes.
See `roles/` for the available manifests.
