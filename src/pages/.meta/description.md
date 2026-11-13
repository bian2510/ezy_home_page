# src/pages/

**Purpose:** Route-level page components registered in `App.tsx`. Each page
composes layout shells, feature slices, and primitives into a full screen.

## Key Components

- `HomePage.tsx` — landing: composes the `features/home` sections (hero, products, categories, benefits, how it works)
- `NotFoundPage.tsx` — 404 for unknown routes (`NotFoundState`)
- `ProductDetailPage.tsx` — `/productos/:id`, composes `features/product`
- `ComoComprarPage.tsx` — `/como-comprar`, the three purchase steps with the mock photos
- `QuienesSomosPage.tsx` — `/quienes-somos`; its texts live in `data/aboutUs.ts`
- `ContactoPage.tsx` — `/contacto`: WhatsApp, email (copy to clipboard + toast) and Instagram cards from `data/siteContact.ts`. Business hours are hardcoded in `SITE_CONTACT.hours` (the ERP only returns them inside an order). The projects band (`ContactProjectsBand`) only shows in `pnpm dev`, not in the production build

## Dependencies

- `react-router-dom` for navigation (`Link`)
- Shared primitives from `@/components/ui` (`PageHeader`, `Container`, `SectionBand`, …)
- Feature slices from `@/features/*`

## Patterns

- One file per route
- Pages own page-level state only; persistent data lives in feature hooks
- Page filenames end with `Page` and use PascalCase

## Constraints

- Pages must be reachable from `App.tsx` — add the corresponding `<Route>` when introducing a new page
- No direct DOM access
- Keep pages thin: same line limits as any component (`docs/standards/reglas-componentes.md`: over 200 lines, split)
- Content pages start with `PageHeader` (frontend-conventions §6)
