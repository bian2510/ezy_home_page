# Contributing to EzyHome Storefront

## Development Setup

1. Install Node.js 18.18+ (20 LTS recommended) and enable pnpm via
   `corepack enable`.
2. Clone the repository and run `pnpm install`.
3. Copy `.env.example` to `.env` and adjust if necessary.
4. Run `pnpm prepare` once to wire up the Husky hooks.
5. Start the dev server with `pnpm dev`.

## Branching

- `main` — protected, always deployable.
- `feat/<short-slug>` — new features.
- `fix/<short-slug>` — bug fixes.
- `chore/<short-slug>` — tooling, deps, refactors without behaviour change.

Rebase on `main` before opening a PR.

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/).
Examples:

- `feat(catalog): add product card skeleton`
- `fix(cart): correct quantity rounding`
- `chore(deps): bump vite to 5.4.4`

Commit messages are linted by `@commitlint/config-conventional` via a
`commit-msg` hook.

## Pull Request Process

1. Ensure `pnpm lint`, `pnpm typecheck`, and `pnpm test` all pass locally.
2. Update the relevant `.meta/description.md` file(s) when you change a
   directory's purpose, dependencies, patterns, or constraints.
3. Open a PR against `main`. Describe the user-facing change and link the
   issue or journey it addresses.
4. At least one reviewer approval is required. CI must be green.

## Running the Test Suite

- `pnpm test` — single run, used by CI.
- `pnpm test:watch` — local TDD loop.
- `pnpm test:coverage` — generates an HTML/lcov report under `coverage/`.

Add unit tests under `tests/unit/` for pure functions and component logic.
Add integration tests under `tests/integration/` for multi-component or
routing flows. Co-located `*.test.tsx` files inside `src/features/<x>/` are
also welcome for tightly-scoped slices.
