# src/components/

**Purpose:** Shared presentation components reused across pages and feature
slices. Split into `ui/` (design-system primitives) and `layout/` (global
chrome such as header and footer).

## Key Components
- `ui/` — base primitives: `Button`, future `Input`, `Card`, `Badge`, etc.
- `layout/` — `SiteHeader`, `SiteFooter`, and other persistent chrome

## Dependencies
- `react` for component definitions
- `react-router-dom` (`Link`) inside layout components for nav
- Tailwind utility classes from the project's design tokens

## Patterns
- Stateless and prop-driven where possible
- Composable via `className` overrides; primitives expose `...rest` HTML props
- Accessibility-first: every interactive element has a visible label and focus ring

## Constraints
- No business logic, no data fetching, no feature-specific imports
- Components living here must work in any page or feature slice
- Anything coupled to a single feature belongs under `src/features/<slice>/components/`
