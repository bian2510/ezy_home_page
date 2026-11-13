# src/layouts/

**Purpose:** Route-level layout shells used via `<Route element={...}>` in
`App.tsx`. They render persistent chrome plus an `<Outlet />` slot for the
nested page.

## Key Components

- `RootLayout.tsx` — header + full-width main + footer; used by every route

## Dependencies

- `react-router-dom` (`Outlet`)
- `@/components/layout/SiteHeader`, `@/components/layout/SiteFooter`
- Tailwind utilities for the flex column shell

## Patterns

- Flex column with `min-h-dvh` so the footer sits at the viewport bottom on short pages
- `components/ui/Container` (`max-w-content`, 1280 px, mock gutters) shared with the header/footer
- `<main>` is full-width for every route: each page renders its own bands with a `Container` inside (`components/ui/SectionBand`), and content pages start with `components/ui/PageHeader` (see docs/frontend-conventions.md §6)

## Constraints

- Layouts must not render route-specific UI; that's the page's job
- New layouts go here only when a route group needs a distinct shell (for example a `/checkout` flow)
