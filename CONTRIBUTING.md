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

1. Ensure the full quality gate passes locally:

   ```bash
   pnpm lint && pnpm typecheck && pnpm format:check && pnpm test
   ```

   Pushing with the intention of "CI will catch it" is not acceptable.

2. Update the relevant `.meta/description.md` file(s) when you change a
   directory's purpose, dependencies, patterns, or constraints.
3. Open a PR against `main`. Describe the user-facing change and link the
   issue or journey it addresses.
4. CI must be green. Reviewer approval is required whenever more than one
   person is working on the repo; today it has a single maintainer, who merges
   their own PRs.

Merging into `main` publishes the site. See
[`docs/guides/deploy-y-ci.md`](docs/guides/deploy-y-ci.md).

## Where the Standards Live

Coding standards, architecture rules and step-by-step guides are under `docs/`,
in Spanish. `CLAUDE.md` maps each kind of task to the document to read first.

## Running the Test Suite

- `pnpm test` — single run, used by CI.
- `pnpm test:watch` — local TDD loop.
- `pnpm test:coverage` — generates an HTML/lcov report under `coverage/`.

Add unit tests under `tests/unit/` for pure functions and component logic.
Add integration tests under `tests/integration/` for multi-component or
routing flows. Co-located `*.test.tsx` files inside `src/features/<x>/` are
also welcome for tightly-scoped slices.
