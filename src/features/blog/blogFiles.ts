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
export const blogFiles = import.meta.glob<{ default: string }>(
  '../../data/blog/*.md',
  { query: '?raw', eager: false },
);
