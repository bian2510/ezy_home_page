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

| What you need | Where to find it |
|---|---|
| Business domain and constraints | `DOMAIN.md` |
| Customer journeys | `docs/mvp/journeys/` |
| Per-bounded-context requirements | `docs/prds/` |
| Architectural decisions | `docs/adrs/` |
| Ground truth research | `docs/sources/` |
| Implementation plans (dated) | `docs/plans/` |
| Engineering standards | `docs/standards/` |
| Operational runbooks | `docs/guides/` |
| Feature specs (ETC harness) | `.etc_sdlc/features/` |
| App source | `src/` |
| Tests | `tests/` |

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
- *(ninguno registrado aún — se crean a medida que se toman decisiones arquitectónicas)*

---

## Role Manifests

Agents working in this repo should load context through their role manifest in
`roles/`. Manifests declare which slices of this tree a role consumes.
See `roles/` for the available manifests.
