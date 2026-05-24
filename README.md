# EzyHome Storefront

Mobile-first online store for home automation products. React + TypeScript + Vite
SPA served via Docker multi-stage build (nginx), deployable to any container host.

## Overview

| Area              | Choice                                        |
| ----------------- | --------------------------------------------- |
| Framework         | React 18 + Vite 5                             |
| Language          | TypeScript 5 (strict)                         |
| Styling           | Tailwind CSS 3 (design tokens)                |
| Routing           | react-router-dom 6                            |
| Testing           | Vitest + Testing Library + jsdom              |
| Linting           | ESLint 9 flat config + Prettier 3             |
| Hooks             | Husky + lint-staged + commitlint              |
| CI                | GitHub Actions                                |
| Containerización  | Docker multi-stage + nginx:stable-alpine      |

## Prerequisites

**Development (local)**
- Node.js >= 18.18 (Node 20 LTS recommended)
- pnpm 9 (`corepack enable && corepack prepare pnpm@9.2.0 --activate`)

**Docker**
- Docker >= 24
- Docker Compose v2 (`docker compose` — plugin, not `docker-compose`)

## Setup

```bash
pnpm install
cp .env.example .env          # set VITE_WHATSAPP_NUMBER (digits only, no +)
pnpm prepare                  # installs Husky hooks
```

## Run (local dev)

| Command                | Purpose                              |
| ---------------------- | ------------------------------------ |
| `pnpm dev`             | Start Vite dev server on :5173       |
| `pnpm build`           | Type-check + production build        |
| `pnpm preview`         | Serve the production bundle locally  |
| `pnpm test`            | Run the Vitest suite once            |
| `pnpm test:watch`      | Vitest in watch mode                 |
| `pnpm test:coverage`   | Vitest with v8 coverage              |
| `pnpm lint`            | ESLint over the whole project        |
| `pnpm format`          | Prettier write                       |
| `pnpm typecheck`       | tsc --noEmit                         |

## Docker

The production image uses a two-stage build:
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

| Asset type          | Cache-Control                                   |
| ------------------- | ----------------------------------------------- |
| Hashed JS/CSS       | `public, max-age=31536000, immutable`           |
| `index.html`        | `no-cache, no-store, must-revalidate`           |

## Project Layout

```
.
├── public/              Static assets served as-is (images/, robots.txt)
├── src/
│   ├── assets/          Images, fonts, SVGs imported by modules
│   ├── components/      Shared UI primitives (ui/) + layout chrome (layout/)
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
│   └── integration/     Component + routing integration tests
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

Build and push the Docker image to any registry, then deploy to the target host:

```bash
# Build production image
docker build \
  --build-arg VITE_WHATSAPP_NUMBER=$VITE_WHATSAPP_NUMBER \
  -t ghcr.io/<org>/ezyhome:$(git rev-parse --short HEAD) .

# Push
docker push ghcr.io/<org>/ezyhome:<tag>

# Run on host (EC2, Fly.io, Railway, etc.)
docker run -d -p 80:80 ghcr.io/<org>/ezyhome:<tag>
```

The container runs nginx as a non-root user (`USER nginx`) and exposes port 80.
Map to whatever external port the host requires.

## Standards

See `.meta/description.md` files for per-directory contracts and
`CONTRIBUTING.md` for the contribution workflow.
