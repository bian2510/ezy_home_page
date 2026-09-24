# .github/

**Purpose:** GitHub-platform configuration: CI workflows, security
workflows, and Dependabot rules.

## Key Components

- `workflows/ci.yml` — lint, typecheck, test, build and deploy jobs on push/PR to `main`
  (`deploy` only on push to `main`: publishes to Cloudflare Pages, then smoke-tests it)
- `workflows/security.yml` — Gitleaks secret scan + `pnpm audit` on push/PR and weekly cron
- `dependabot.yml` — weekly npm and GitHub Actions update PRs with grouping

## Dependencies

- GitHub Actions runners (`ubuntu-latest`)
- `pnpm/action-setup@v4`, `actions/setup-node@v4`, `actions/checkout@v4`, `actions/upload-artifact@v4`
- `gitleaks/gitleaks-action@v2` for secret scanning
- `actions/download-artifact@v4` and `cloudflare/wrangler-action@v4` in the deploy job
- Secrets: `VITE_WHATSAPP_NUMBER` (build), `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (deploy)

## Patterns

- Concurrency group cancels superseded CI runs on the same ref
- Caching keyed on the pnpm lockfile via `setup-node`
- Build job depends on lint/typecheck/test passing first, and enforces the
  105 kB gzip critical-path budget via `pnpm check:bundle`
- Deploy publishes the `dist/` artifact rather than recompiling, so what ships
  is exactly what was verified; `scripts/smoke-test.sh` then checks the live site
- Dependabot groups react and dev-tooling updates to reduce PR noise

## Constraints

- Workflows assume Node 20; bump in lockstep with `package.json` `engines`
- `pnpm audit` runs on production deps only — dev vulnerabilities are tracked separately
- Permissions are minimised (`contents: read`, `security-events: write` and
  `deployments: write` only where needed)
- The deploy job needs `actions/checkout` even though it does not compile: without
  it `scripts/smoke-test.sh` is absent. That checkout exposes `pnpm-lock.yaml`, so
  wrangler-action must be pinned to `packageManager: npm`
- Rollback is manual, from the Cloudflare dashboard — see `docs/guides/deploy-y-ci.md`
