# .github/

**Purpose:** GitHub-platform configuration: CI workflows, security
workflows, and Dependabot rules.

## Key Components
- `workflows/ci.yml` — lint, typecheck, test, build jobs on push/PR to `main`
- `workflows/security.yml` — Gitleaks secret scan + `pnpm audit` on push/PR and weekly cron
- `dependabot.yml` — weekly npm and GitHub Actions update PRs with grouping

## Dependencies
- GitHub Actions runners (`ubuntu-latest`)
- `pnpm/action-setup@v4`, `actions/setup-node@v4`, `actions/checkout@v4`, `actions/upload-artifact@v4`
- `gitleaks/gitleaks-action@v2` for secret scanning

## Patterns
- Concurrency group cancels superseded CI runs on the same ref
- Caching keyed on the pnpm lockfile via `setup-node`
- Build job depends on lint/typecheck/test passing first
- Dependabot groups react and dev-tooling updates to reduce PR noise

## Constraints
- Workflows assume Node 20; bump in lockstep with `package.json` `engines`
- `pnpm audit` runs on production deps only — dev vulnerabilities are tracked separately
- Permissions are minimised (`contents: read`, `security-events: write` only where needed)
