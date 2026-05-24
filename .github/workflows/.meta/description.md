# .github/workflows/

**Purpose:** GitHub Actions pipeline definitions.

## Key Components
- `ci.yml` — four jobs: `lint`, `typecheck`, `test` (with coverage upload), `build` (with `dist/` artifact)
- `security.yml` — `gitleaks` secret scan + `pnpm audit --prod --audit-level=high`; runs on push, PR, and Monday cron

## Dependencies
- `actions/checkout@v4`, `actions/setup-node@v4`, `pnpm/action-setup@v4`, `actions/upload-artifact@v4`, `gitleaks/gitleaks-action@v2`

## Patterns
- Pinned action versions (major-only); Dependabot bumps them weekly
- Pnpm cache enabled via `setup-node`'s `cache: pnpm` for fast installs
- Artifacts retained 7 days (coverage) / 14 days (dist) to balance debuggability vs storage

## Constraints
- Single-OS matrix (`ubuntu-latest`) — multi-OS would only be added if the build target changes
- Single Node version (20) — `package.json` `engines` declares `>=18.18`; bump matrix only when policy demands it
- Workflows must remain side-effect free until the deploy workflow is introduced
