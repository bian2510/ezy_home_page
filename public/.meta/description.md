# public/

**Purpose:** Static assets served verbatim by Vite at the site root. Files
here are NOT hashed or processed — they keep their original filename and URL.

## Key Components

- `favicon.png` — site icon, also used as the apple-touch-icon
- `images/` — hero and blog imagery referenced by absolute path
- `google*.html` — Google Search Console ownership proof. Google fetches it
  byte-for-byte, so it is excluded from Prettier in `.prettierignore`.

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
- Deleting the Search Console file un-verifies the property in Google
