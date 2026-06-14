# EzyHome — Project Orientation

**What this is:** Tienda online de domótica con blog informativo — catálogo de productos, carrito persistente, checkout vía WhatsApp.

**Read order for new agents:**

1. `DOMAIN.md` — qué hace EzyHome y por qué (contexto de negocio, restricciones, implicaciones de diseño)
2. This file — dónde encontrar las cosas en el repo
3. The PRD for your task's bounded context (see `docs/prds/`)
4. `docs/sources/` — investigación que informó los PRDs

---

## Current Phase

**MVP build — scaffolding técnico completo. Implementando tienda online: catálogo, carrito, checkout WhatsApp, y blog informativo.**

---

## Where Things Live

| What you need                           | Where to find it                                    |
| --------------------------------------- | --------------------------------------------------- |
| Business domain and constraints         | `DOMAIN.md`                                         |
| Customer journeys                       | `docs/mvp/journeys/`                                |
| Per-bounded-context requirements        | `docs/prds/`                                        |
| Architectural decisions (ADRs)          | `docs/adrs/` — índice en `docs/standards/README.md` |
| Ground truth research                   | `docs/sources/`                                     |
| Implementation plans (dated)            | `docs/plans/`                                       |
| Architecture layer map + import rules   | `docs/standards/capas-arquitectura.md`              |
| Where to put a component (ui/ vs feat.) | `docs/standards/componentes-ui-vs-feature.md`       |
| Feature module structure + index.ts     | `docs/standards/modulos-feature.md`                 |
| State management patterns               | `docs/standards/gestion-estado.md`                  |
| Images and PDFs per product             | `docs/standards/assets-estaticos.md`                |
| All engineering standards (index)       | `docs/standards/README.md`                          |
| Code conventions (TS, Tailwind, tests)  | `docs/frontend-conventions.md`                      |
| How to add a product                    | `docs/guides/agregar-producto.md`                   |
| How to add a PDF manual                 | `docs/guides/agregar-pdf-manual.md`                 |
| How to add a new feature module         | `docs/guides/agregar-feature.md`                    |
| All operational guides (index)          | `docs/guides/README.md`                             |
| Feature specs (ETC harness)             | `.etc_sdlc/features/`                               |
| App source                              | `src/`                                              |
| Tests                                   | `tests/`                                            |

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
- **Hosting target:** AWS EC2 (misma instancia que app existente)
- **Email (futuro):** Resend — ya disponible en app existente del dueño

**Key ADRs to read before touching architecture:**

- [`ADR-004`](docs/adrs/ADR-004-arquitectura-frontend-capas.md) — Arquitectura en capas Feature-Sliced Lite (flujo de imports, encapsulamiento por feature)
- [`F001-001`](docs/adrs/F001-001-cart-state-react-context.md) — React Context para carrito (no Zustand)
- [`F001-002`](docs/adrs/F001-002-tailwind-token-remapping.md) — Tokens de diseño EzyHome
- [`F001-003`](docs/adrs/F001-003-blog-static-markdown.md) — Blog estático con Markdown

---

## Role Manifests

Agents working in this repo should load context through their role manifest in
`roles/`. Manifests declare which slices of this tree a role consumes.
See `roles/` for the available manifests.
