# public/

**Purpose:** Static assets served verbatim by Vite at the site root. Files
here are NOT hashed or processed — they keep their original filename and URL.

## Key Components

- `robots.txt` — search-engine crawl policy (currently open)

## Dependencies

- None (consumed by the browser, not imported by code)

## Patterns

- Reference files by absolute path (`/robots.txt`, `/favicon.ico`)
- Use `public/` only for assets that need a stable URL

## Constraints

- Anything imported from code must live in `src/assets/`, not here
- No secrets — every file in `public/` is publicly fetchable
- Keep the directory small; large media should sit on a CDN
