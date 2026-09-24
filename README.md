# EzyHome Storefront

Mobile-first online store for home automation products. React + TypeScript + Vite
SPA, deployed as a static site to **Cloudflare Pages** by GitHub Actions on every
push to `main`.

## Overview

| Area              | Choice                                  |
| ----------------- | --------------------------------------- |
| Framework         | React 18 + Vite 5                       |
| Language          | TypeScript 5 (strict)                   |
| Styling           | Tailwind CSS 3 (design tokens)          |
| Routing           | react-router-dom 6                      |
| Testing           | Vitest + Testing Library + jsdom        |
| Linting           | ESLint 9 flat config + Prettier 3       |
| Hooks             | Husky + lint-staged + commitlint        |
| CI / CD           | GitHub Actions → Cloudflare Pages       |
| Hosting           | Cloudflare Pages (`ezyhome-storefront`) |
| Docker (optional) | Multi-stage + nginx, local use only     |

## Prerequisites

**Development (local)**

- Node.js >= 18.18 (Node 20 LTS recommended)
- Node.js >= 22 only for `pnpm precios:*` — those scripts run TypeScript
  directly via native type stripping, with no build step
- pnpm 9 (`corepack enable && corepack prepare pnpm@9.2.0 --activate`)

**Docker (optional — not used for deployment)**

- Docker >= 24
- Docker Compose v2 (`docker compose` — plugin, not `docker-compose`)

## Setup

```bash
pnpm install
cp .env.example .env          # set VITE_WHATSAPP_NUMBER (digits only, no +)
pnpm prepare                  # installs Husky hooks
```

## Run (local dev)

| Command              | Purpose                             |
| -------------------- | ----------------------------------- |
| `pnpm dev`           | Start Vite dev server on :5173      |
| `pnpm build`         | Type-check + production build       |
| `pnpm preview`       | Serve the production bundle locally |
| `pnpm test`          | Run the Vitest suite once           |
| `pnpm test:watch`    | Vitest in watch mode                |
| `pnpm test:coverage` | Vitest with v8 coverage             |
| `pnpm lint`          | ESLint over the whole project       |
| `pnpm format`        | Prettier write                      |
| `pnpm typecheck`     | tsc --noEmit                        |

### Catalog and release commands

| Command                      | Purpose                                                         |
| ---------------------------- | --------------------------------------------------------------- |
| `pnpm validate:products`     | Validate `src/data/products.json` against the runtime schema    |
| `pnpm precios:informe`       | Dry-run report of a Mercado Libre price export (writes nothing) |
| `pnpm precios:aplicar`       | Apply that export to the catalog                                |
| `pnpm check:bundle`          | Fail if the critical path exceeds the 105 kB gzip budget        |
| `bash scripts/smoke-test.sh` | Check that production serves the expected build                 |

See [`docs/guides/actualizar-precios.md`](docs/guides/actualizar-precios.md) for the
monthly price routine and [`docs/guides/deploy-y-ci.md`](docs/guides/deploy-y-ci.md)
for the release pipeline.

## Docker (optional, local only)

**This is not how the site is deployed.** Production is a static build on
Cloudflare Pages — no nginx of ours, no container, no server. The Docker setup is
kept for running the production bundle locally in a container.

The image uses a two-stage build:

1. **builder** — `node:20-alpine`, installs deps, runs `pnpm build`
2. **runtime** — `nginx:stable-alpine`, serves the static bundle as a non-root user

```bash
# Build + run with docker compose (reads VITE_WHATSAPP_NUMBER from .env)
docker compose up --build

# Build manually
docker build \
  --build-arg VITE_WHATSAPP_NUMBER=5491122334455 \
  -t ezyhome:latest .

# Run the image
docker run -p 3000:80 ezyhome:latest
```

The app is served on `http://localhost:3000`. nginx is configured with SPA fallback
(`try_files $uri $uri/ /index.html`) so deep links and page refreshes work correctly.

### Cache headers

| Asset type    | Cache-Control                         |
| ------------- | ------------------------------------- |
| Hashed JS/CSS | `public, max-age=31536000, immutable` |
| `index.html`  | `no-cache, no-store, must-revalidate` |

## Project Layout

```
.
├── public/              Static assets served as-is (images/, robots.txt)
├── src/
│   ├── assets/          Images, fonts, SVGs imported by modules
│   ├── components/      Shared UI primitives (ui/) + layout chrome (layout/)
│   ├── data/            Product catalog JSON + zod schema + typed accessor
│   ├── features/        Vertical slices (catalog, cart, blog)
│   ├── hooks/           Reusable React hooks
│   ├── layouts/         Route-level layout shells
│   ├── lib/             Pure helpers (no React)
│   ├── pages/           Route-level page components
│   ├── styles/          Global CSS and Tailwind layers
│   ├── types/           Cross-feature shared TS types
│   ├── App.tsx          Top-level router
│   └── main.tsx         Vite/React entry point
├── tests/
│   ├── setup.ts         Vitest setup (RTL matchers)
│   ├── unit/            Pure unit tests
│   ├── data/            Catalog validation against the schema
│   └── integration/     Component + routing integration tests
├── scripts/
│   ├── actualizar-precios.ts  Bulk price/stock update from a Mercado Libre export
│   ├── lib/precios.ts         Pure logic behind it (unit-tested)
│   ├── check-bundle-size.js   Critical-path gzip budget, enforced in CI
│   └── smoke-test.sh          Post-deploy verification of the live site
├── docs/                Standards, guides, ADRs and plans (see docs/guides/README.md)
├── Dockerfile           Multi-stage build (builder + runtime)
├── docker-compose.yml   Local container environment
├── nginx.conf           SPA routing + cache-control rules
├── .github/workflows/   CI pipelines
├── eslint.config.js     Flat ESLint config
├── tailwind.config.ts   Design tokens + theme extensions
├── vite.config.ts       Build / dev server configuration
└── vitest.config.ts     Test runner configuration
```

## Deployment

The site is deployed automatically. There is no manual deploy step and no
container registry involved.

1. Push to `main` (or merge a PR into it).
2. GitHub Actions runs lint, typecheck, tests and build in `.github/workflows/ci.yml`.
3. The `deploy` job publishes `dist/` to Cloudflare Pages with
   `cloudflare/wrangler-action@v4`.
4. `scripts/smoke-test.sh` verifies that the live domain serves the build that was
   just published — not a previous one.

Live at `https://ezyhome-storefront.pages.dev`.

**Rolling back** is a single click in the Cloudflare dashboard (Deployments ›
pick the last good one › _Rollback to this deployment_). It is deliberately
manual. The full pipeline, its required secrets and the failure playbook are
documented in [`docs/guides/deploy-y-ci.md`](docs/guides/deploy-y-ci.md).

## Standards

Engineering standards and step-by-step guides live under `docs/`, in Spanish:

| Where                        | What                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| `CLAUDE.md`                  | Which doc to read for which task, and the quality gate       |
| `docs/standards/README.md`   | Architecture layers, component rules, testing, design tokens |
| `docs/guides/README.md`      | Operational guides (catalog, prices, deploy)                 |
| `docs/adrs/`                 | Why each technical decision was made                         |
| `.meta/description.md` files | Per-directory contracts                                      |

`CONTRIBUTING.md` covers the contribution workflow. No task is done until
`pnpm lint && pnpm typecheck && pnpm format:check && pnpm test` is green.
