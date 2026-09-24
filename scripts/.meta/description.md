# scripts/

**Purpose:** Operational scripts that run outside the app bundle: catalog
maintenance, release guardrails, and post-deploy verification. Nothing here
ships to the browser.

## Key Components

- `actualizar-precios.ts` — CLI that updates `src/data/products.json` from a
  Mercado Libre price export. I/O and console output only. Reports by default,
  writes with `--aplicar`. Wired as `pnpm precios:informe` / `pnpm precios:aplicar`.
- `lib/precios.ts` — the pure logic behind it (CSV parsing, duplicate grouping,
  price rules, catalog linking). Covered by `tests/unit/actualizarPrecios.test.ts`.
- `check-bundle-size.js` — measures the gzip weight of the assets referenced by
  `dist/index.html` and fails above 105 kB. Runs in the CI `build` job as
  `pnpm check:bundle`.
- `smoke-test.sh` — verifies that production responds, that the referenced bundle
  downloads, and that the domain serves the build just deployed. Runs in the CI
  `deploy` job.

## Dependencies

- Node 22+ for `actualizar-precios.ts` and `lib/precios.ts`: they are run
  directly as TypeScript via native type stripping, with no build step.
- `curl` and `bash` for `smoke-test.sh`.
- `check-bundle-size.js` reads `dist/`, so it requires a prior `pnpm build`.

## Patterns

- Logic and I/O are separated: pure functions live in `lib/` so they can be
  unit-tested without files, network or `process.argv`.
- Anything that writes has a dry-run first. `precios:informe` reports and exits;
  only `--aplicar` touches the catalog.
- Flags are parsed order-independently — `pnpm precios:aplicar` prepends
  `--aplicar` and the CSV path arrives after it.
- Console output and comments are in Spanish, like the rest of the operational
  docs; identifiers follow the repo's TypeScript conventions.

## Constraints

- These files are covered by `tsconfig.node.json`, which mirrors
  `noUncheckedIndexedAccess` from `tsconfig.app.json`. Keep both aligned:
  otherwise `eslint --fix` strips assertions that `pnpm typecheck` then demands.
- `actualizar-precios.ts` never touches editorial fields (`name`, `description`,
  `images`, `category`, `isBestseller`, `promotionBadge`) — a test enforces it.
- Changing the 105 kB budget in `check-bundle-size.js` requires a justification
  in the commit; otherwise the budget becomes decoration.
- Guides: `docs/guides/actualizar-precios.md` and `docs/guides/deploy-y-ci.md`.
