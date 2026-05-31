# src/assets/

**Purpose:** Module-imported static assets (images, SVGs, fonts) that Vite
should hash and bundle. Currently empty.

## Key Components

- None yet (`.gitkeep` placeholder)

## Dependencies

- Consumers import assets directly (`import logo from '@/assets/logo.svg'`)

## Patterns

- SVGs preferred over raster for product iconography
- Filenames in `kebab-case`
- Group by media type if the directory grows (`images/`, `icons/`, `fonts/`)

## Constraints

- Assets that don't need hashing (robots.txt, favicons) live in `public/`, not here
- Keep individual files under 200 KB; larger assets need a separate review
