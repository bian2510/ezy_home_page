# scripts/

**Purpose:** Operational scripts that run outside the app bundle: build-time
SEO files, release guardrails, and post-deploy verification. Nothing here
ships to the browser.

## Key Components

- `vite-plugin-seo.ts` + `lib/sitemap.ts` — emit `sitemap.xml` and `robots.txt`
  on every build from `products.json` and the blog index.
- `check-bundle-size.js` — measures the gzip weight of the assets referenced by
  `dist/index.html` and fails above 105 kB. Runs in the CI `build` job as
  `pnpm check:bundle`.
- `smoke-test.sh` — verifies that production responds, that the referenced bundle
  downloads, and that the domain serves the build just deployed. Runs in the CI
  `deploy` job.

## Dependencies

- `curl` and `bash` for `smoke-test.sh`.
- `check-bundle-size.js` reads `dist/`, so it requires a prior `pnpm build`.

## Patterns

- Logic and I/O are separated: pure functions live in `lib/` so they can be
  unit-tested without files, network or `process.argv`.
- Console output and comments are in Spanish, like the rest of the operational
  docs; identifiers follow the repo's TypeScript conventions.

## Constraints

- These files are covered by `tsconfig.node.json`, which mirrors
  `noUncheckedIndexedAccess` from `tsconfig.app.json`. Keep both aligned:
  otherwise `eslint --fix` strips assertions that `pnpm typecheck` then demands.
- Changing the 105 kB budget in `check-bundle-size.js` requires a justification
  in the commit; otherwise the budget becomes decoration.
- Guide: `docs/guides/deploy-y-ci.md`. Prices no longer come from a script:
  they come from the ERP (`docs/guides/actualizar-precios.md`).
