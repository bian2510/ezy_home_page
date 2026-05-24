# src/pages/

**Purpose:** Route-level page components registered in `App.tsx`. Each page
composes layout shells, feature slices, and primitives into a full screen.

## Key Components
- `HomePage.tsx` — landing page placeholder (welcome headline + intro copy)
- `NotFoundPage.tsx` — 404 fallback with link back to `/`

## Dependencies
- `react-router-dom` for navigation (`Link`)
- Shared primitives from `@/components/ui` (future)
- Feature slices from `@/features/*` (future)

## Patterns
- One file per route
- Pages own page-level state only; persistent data lives in feature hooks
- Page filenames end with `Page` and use PascalCase

## Constraints
- Pages must be reachable from `App.tsx` — add the corresponding `<Route>` when introducing a new page
- No direct DOM access
- Keep pages thin (`<= 150` lines); push UI into components/features
