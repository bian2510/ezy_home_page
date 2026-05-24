# .husky/

**Purpose:** Git client-side hooks managed by Husky 9. Provides the local
fast-feedback layer that CI cannot give (sub-second per commit).

## Key Components
- `pre-commit` — runs `pnpm exec lint-staged` (ESLint + Prettier on staged files)
- `commit-msg` — runs `pnpm exec commitlint --edit "$1"` to enforce Conventional Commits
- `pre-push` — runs `pnpm typecheck && pnpm test` before pushing

## Dependencies
- `husky` installs hooks via the `prepare` npm script
- `lint-staged` (`package.json` config) drives per-file linting
- `@commitlint/cli` + `@commitlint/config-conventional` validate commit messages

## Patterns
- Husky 9 hooks are plain shell scripts; no boilerplate header required
- Hooks call `pnpm exec` so the project's pinned binaries are used (not whatever the user has globally)

## Constraints
- Hooks must complete in under 10 seconds for a typical commit (per the bootstrap config philosophy)
- Never bypass with `--no-verify` unless explicitly authorised
- File-hygiene and secret-scan layers belong in `.pre-commit-config.yaml` (separate framework) so they apply regardless of pnpm being installed
