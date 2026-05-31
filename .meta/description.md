# EzyHome Storefront (root)

**Purpose:** Mobile-first React + TypeScript single-page storefront for the
EzyHome home-automation product line. Pure frontend; backend integration
arrives later through a typed API client under `src/lib`.

## Key Components

- `src/` — application source (entry point, routing, pages, features, UI)
- `tests/` — Vitest unit and integration suites
- `public/` — static assets copied verbatim into the bundle
- `.github/` — CI (`workflows/ci.yml`), security scans (`workflows/security.yml`), Dependabot config
- `.husky/` — Git hooks (lint-staged pre-commit, commitlint commit-msg, test pre-push)
- `docs/` — product documentation, including the J-001 customer journey
- `index.html` — Vite entry HTML
- `vite.config.ts`, `vitest.config.ts`, `tailwind.config.ts`, `postcss.config.js` — build, test, and styling configs
- `eslint.config.js`, `.prettierrc.json`, `commitlint.config.js`, `.editorconfig` — code quality configs
- `tsconfig.json` (+ `tsconfig.app.json`, `tsconfig.node.json`) — TypeScript project references
- `package.json` — npm scripts and dependency manifest (pnpm 9 as canonical PM)
- `DOMAIN.md`, `PROJECT.md` — domain and project intent (currently placeholders)
- `README.md`, `CONTRIBUTING.md` — operator and contributor docs

## Dependencies

- Runtime: `react`, `react-dom`, `react-router-dom`
- Build/test: `vite`, `@vitejs/plugin-react`, `vitest`, `@vitest/coverage-v8`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- Styling: `tailwindcss`, `postcss`, `autoprefixer`, `prettier-plugin-tailwindcss`
- Quality: `eslint`, `typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-plugin-jsx-a11y`, `eslint-config-prettier`, `prettier`
- Hooks: `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional`
- Tooling target: Node >= 18.18, pnpm 9.2.0

## Patterns

- Vite SPA with React 18 StrictMode and `react-router-dom` BrowserRouter
- Path alias `@/* -> src/*` enforced in `tsconfig.app.json` and Vite resolver
- Feature-sliced layout under `src/features/<slice>` separated from shared `components`, `hooks`, `lib`
- Tailwind design tokens centralised in `tailwind.config.ts` (`brand`, `surface`, `text` colour scales; `Inter` font stack; `max-w-content` container)
- Quality gates layered: lint-staged at commit, commitlint on message, typecheck+test on push, full matrix on CI
- Conventional Commits enforced repo-wide

## Constraints

- Mobile-first; every component must work on >= 320px viewport before adding desktop styles
- TypeScript `strict` plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` — no `any` escapes
- No backend code in this repo; all data access goes through the future `src/lib/api` client
- No secrets in client bundle: only `VITE_`-prefixed env vars reach the browser
- File and function size limits from `~/.claude/standards/code/clean-code.md` apply (functions <= 50 lines, files <= 300 lines)
- Static bundle target — no server-side rendering, no Node runtime at deploy time
