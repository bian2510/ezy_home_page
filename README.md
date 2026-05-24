# EzyHome Storefront

Mobile-first online store for home automation products. Pure frontend SPA
built with React + TypeScript + Vite, styled with Tailwind CSS, deployed as
static assets to an existing AWS EC2 host.

## Overview

| Area              | Choice                             |
| ----------------- | ---------------------------------- |
| Framework         | React 18 + Vite 5                  |
| Language          | TypeScript 5 (strict)              |
| Styling           | Tailwind CSS 3 (design tokens)     |
| Routing           | react-router-dom 6                 |
| Testing           | Vitest + Testing Library + jsdom   |
| Linting           | ESLint 9 flat config + Prettier 3  |
| Hooks             | Husky + lint-staged + commitlint   |
| CI                | GitHub Actions                     |
| Hosting           | AWS EC2 (static build behind nginx)|

## Prerequisites

- Node.js >= 18.18 (Node 20 LTS recommended)
- pnpm 9 (`corepack enable && corepack prepare pnpm@9.2.0 --activate`)

## Setup

```bash
pnpm install
cp .env.example .env
pnpm prepare         # installs Husky hooks
```

## Run

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

## Project Layout

```
.
├── public/              Static assets served as-is by Vite
├── src/
│   ├── assets/          Images, fonts, SVGs imported by modules
│   ├── components/      Shared UI primitives (ui/) + layout chrome (layout/)
│   ├── features/        Vertical slices (catalog, cart, ...)
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
├── .meta/               Auto-maintained architecture descriptions
├── .github/workflows/   CI pipelines
├── eslint.config.js     Flat ESLint config
├── tailwind.config.ts   Design tokens + theme extensions
├── vite.config.ts       Build / dev server configuration
└── vitest.config.ts     Test runner configuration
```

## Deployment

1. `pnpm build` produces `dist/`.
2. CI uploads the bundle to the EC2 host (artefact path published as an
   Actions artifact for now; deploy workflow added once the EC2 access
   path is defined).
3. The EC2 host serves the bundle behind nginx with SPA fallback to
   `index.html` for unknown routes.

## Standards

See `.meta/description.md` files for per-directory contracts and
`CONTRIBUTING.md` for the contribution workflow.
