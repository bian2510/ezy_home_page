# src/

**Purpose:** All TypeScript/TSX application source for the EzyHome storefront.
Contains the Vite entry point, the router, route pages, layout shells, shared
UI primitives, vertical feature slices, hooks, helpers, styles, and shared
types.

## Key Components

- `main.tsx` — Vite/React entry; mounts `<App />` inside `<StrictMode>` and `<BrowserRouter>`
- `App.tsx` — top-level `<Routes>` table; registers `RootLayout`, `HomePage`, `NotFoundPage`
- `components/` — shared UI primitives (`ui/`) and global layout chrome (`layout/`)
- `pages/` — route-level page components
- `layouts/` — shells composed by `App.tsx` (header + main + footer wrappers)
- `features/` — vertical slices (`catalog/`, `cart/`) with their own components, hooks, types
- `hooks/` — reusable React hooks (empty placeholder)
- `lib/` — framework-free utilities (`cn.ts` class joiner)
- `styles/` — global CSS and Tailwind layers (`global.css`)
- `assets/` — static assets imported as modules (images, SVGs, fonts)
- `types/` — cross-feature shared TS types

## Dependencies

- Imports `react`, `react-dom`, `react-router-dom`
- Resolves intra-source modules through the `@/*` path alias
- Consumes Tailwind utility classes generated from `tailwind.config.ts`

## Patterns

- Feature-sliced architecture: shared UI in `components/`, owned UI under `features/<slice>/`
- Path alias `@/*` instead of long relative imports
- Page components are pure presentation; data fetching will sit in feature-level hooks
- Spanish copy is the default user-facing language (mirrors target market)

## Constraints

- No imports from `tests/` or build configs
- No direct DOM manipulation outside React (use refs/effects)
- No global mutable state — colocate state in features or lift via React context
- Every new top-level subdirectory must ship its own `.meta/description.md`
