# Codebase Research — F001 EzyHome Storefront

## Stack (from project-bootstrapper greenfield scaffold)
- React 18 + TypeScript + Vite 5
- Tailwind CSS 3.4 (tailwind.config.ts — tokens are placeholders, need EzyHome palette)
- React Router DOM 6.26 (routing already in dependencies)
- Vitest 2 + Testing Library (tests/ directory ready)
- pnpm 9.2 as package manager

## Feature structure (pre-scaffolded)
- `src/features/catalog/` — empty, ready for catalog implementation
- `src/features/cart/` — empty, ready for cart implementation
- `src/components/ui/Button.tsx` — base Button component exists
- `src/components/layout/SiteHeader.tsx` / `SiteFooter.tsx` — layout shells exist
- `src/lib/cn.ts` — clsx/twMerge utility present

## Patterns in place
- Feature-based directory structure (features/catalog, features/cart)
- `src/types/index.ts` for shared types — Product, Cart types should go here
- `src/data/` directory does NOT exist yet — needs creation for products.json and blog/

## No existing domain logic
- Greenfield: no conflicting implementations to work around
- tailwind.config.ts design tokens are generic placeholders — full replacement with EzyHome palette required
