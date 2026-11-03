# src/components/ui/

**Purpose:** Design-system primitives. Tiny, composable, accessibility-aware
building blocks consumed by every other component.

## Key Components

- `Container.tsx` / `SectionBand.tsx` — page width (`max-w-content`) with the mock gutters, and full-bleed bands
- `Icon.tsx`, `Badge.tsx`, `QuantitySelector.tsx`, `Stepper.tsx`, `Pagination.tsx`, `SearchBox.tsx`, `Drawer.tsx`, `Toast.tsx`, `ErrorBoundary.tsx` — domain-blind primitives

## Dependencies

- `react` types (`ReactNode`, …) and `@/lib` (`cn`)
- Tailwind utility classes for variant styling

## Patterns

- Variant maps (`Record<Variant, string>`) for predictable styling
- Forward all native props via `...rest` so primitives stay drop-in replacements for HTML elements
- Default `type="button"` for buttons to avoid accidental form submission (callers can override)

## Constraints

- No router, no data, no global state
- 44x44 minimum touch target (mobile-first requirement)
- Must remain framework-agnostic enough to be portable to Storybook later
