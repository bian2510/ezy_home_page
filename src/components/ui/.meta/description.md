# src/components/ui/

**Purpose:** Design-system primitives. Tiny, composable, accessibility-aware
building blocks consumed by every other component.

## Key Components

- `Container.tsx` / `SectionBand.tsx` — page width (`max-w-content`) with the mock gutters, and full-bleed bands
- `Icon.tsx`, `Badge.tsx`, `QuantitySelector.tsx`, `Stepper.tsx`, `Pagination.tsx`, `SearchBox.tsx`, `Drawer.tsx`, `Toast.tsx`, `ErrorBoundary.tsx` — domain-blind primitives
- `PageHeader.tsx` — common page header (breadcrumb, the only `h1`, subtitle) every content page starts with; exports `PAGE_TITLE_CLASS` for pages with their own header (frontend-conventions §6)
- `Breadcrumb.tsx` — the one breadcrumb (Inicio / … / current page); `NotFoundState.tsx` — 404 built on `PageHeader` with a back link
- `ContactCard.tsx` — card of a contact channel (icon, title, value box, action), rendered as an `<li>`
- `ContactProjectsBand.tsx` — green "automatizá tu vivienda o proyecto inmobiliario" band of `/contacto`; only rendered in local dev (`isDevelopment`) until the owner decides to offer it

## Dependencies

- `react` types (`ReactNode`, …) and `@/lib` (`cn`)
- Tailwind utility classes for variant styling

## Patterns

- Variant maps (`Record<Variant, string>`) for predictable styling
- Forward all native props via `...rest` so primitives stay drop-in replacements for HTML elements
- Default `type="button"` for buttons to avoid accidental form submission (callers can override)

## Constraints

- No data, no global state. `Link` from the router is allowed for navigation (`Breadcrumb`, `NotFoundState`, `ErrorBoundary`)
- 44x44 minimum touch target (mobile-first requirement)
- Must remain framework-agnostic enough to be portable to Storybook later
