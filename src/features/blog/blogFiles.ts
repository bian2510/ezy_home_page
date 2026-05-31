/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/**
 * Vite-specific loader map for blog Markdown files.
 *
 * Isolated in its own module so that `useBlogPost` can be tested without
 * depending on Vite's `import.meta.glob`, which Vitest's jsdom environment
 * cannot resolve against raw `.md` imports. Tests mock this module.
 *
 * The keys are file paths relative to this file
 * (e.g. `../../data/blog/introduccion-a-la-domotica.md`); the values are
 * lazy loaders returning `{ default: string }` (the raw Markdown body),
 * thanks to `?raw`.
 *
 * See docs/adrs/F001-003-blog-static-markdown.md.
 */
export const blogFiles = (import.meta as any).glob('../../data/blog/*.md', {
  query: '?raw',
  eager: false,
}) as Record<string, () => Promise<{ default: string }>>;
