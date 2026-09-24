# public/

**Purpose:** Static assets served verbatim by Vite at the site root. Files
here are NOT hashed or processed — they keep their original filename and URL.

## Key Components

- `favicon.png` — site icon, also used as the apple-touch-icon
- `images/` — hero and blog imagery referenced by absolute path

`robots.txt` and `sitemap.xml` are NOT here: the build generates them from the
catalog (`scripts/vite-plugin-seo.ts`). Do not add a static copy — two sources
of truth for the crawl policy is how one of them goes stale.

## Dependencies

- None (consumed by the browser, not imported by code)

## Patterns

- Reference files by absolute path (`/robots.txt`, `/favicon.ico`)
- Use `public/` only for assets that need a stable URL

## Constraints

- Anything imported from code must live in `src/assets/`, not here
- No secrets — every file in `public/` is publicly fetchable
- Keep the directory small; large media should sit on a CDN
- Search Console ownership is proved by a meta tag in `index.html`, not by a
  file here: Cloudflare serves this SPA with a 200 catch-all, so Google's
  control fetch of a made-up filename also returns 200 and the file method
  always fails
