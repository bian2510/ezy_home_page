# src/components/layout/

**Purpose:** Persistent chrome rendered on every route — top navigation,
footer, and (later) global banners or skip links.

## Key Components

- `SiteHeader.tsx` — brand link + primary nav, sticky-friendly border, max-content container
- `SiteFooter.tsx` — copyright line, future legal/contact links

## Dependencies

- `react-router-dom` for `<Link>`
- Tailwind utilities for layout, colour, spacing

## Patterns

- Centered max-width container (`max-w-content`) shared with `RootLayout`
- Semantic landmarks: `<header>`, `<nav aria-label="...">`, `<footer>`
- Spanish copy by default

## Constraints

- Must render correctly on >= 320px viewports
- No state, no data fetching, no feature imports
- Header and footer changes propagate to every route — coordinate with the architect before touching IA
