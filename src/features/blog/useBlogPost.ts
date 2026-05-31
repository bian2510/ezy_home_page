/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

import { useEffect, useState } from 'react';
import blogIndex from '@/data/blog/index.json';
import type { BlogMeta } from '@/types';
import { blogFiles } from './blogFiles';

/**
 * Result shape exposed by `useBlogPost`.
 *
 * - `content`: the raw Markdown body of the post, or `null` while loading
 * or when the slug is not found.
 * - `meta`: the matching entry from `src/data/blog/index.json`, or `null`
 * when the slug is not found.
 * - `notFound`: `true` when no entry with the given slug exists in
 * `index.json`. Resolved synchronously on first render.
 * - `loading`: `true` while the Markdown file is being dynamically
 * imported. `false` after success or when `notFound` is `true`.
 */
export interface UseBlogPostResult {
  content: string | null;
  meta: BlogMeta | null;
  notFound: boolean;
  loading: boolean;
}

const BLOG_INDEX: readonly BlogMeta[] = blogIndex as readonly BlogMeta[];

const findMeta = (slug: string): BlogMeta | null =>
  BLOG_INDEX.find((entry) => entry.slug === slug) ?? null;

const loaderKeyForSlug = (slug: string): string => `../../data/blog/${slug}.md`;

/**
 * Loads a single blog post by slug.
 *
 * Looks the slug up in `src/data/blog/index.json` first — that lookup is
 * synchronous, so callers can render a 404 immediately on the first render
 * without flashing a spinner. When the slug is known, the matching
 * `.md` file is dynamically imported (via `blogFiles`, which wraps
 * `import.meta.glob('../../data/blog/*.md', { query: '?raw', eager: false })`)
 * and its raw string body is exposed as `content`.
 *
 * See docs/adrs/F001-003-blog-static-markdown.md.
 */
export function useBlogPost(slug: string): UseBlogPostResult {
  const meta = findMeta(slug);
  const notFound = meta === null;

  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(!notFound);

  useEffect(() => {
    if (meta === null) {
      // Slug is not in the index — nothing to load. Reset transient state
      // in case the previous render had resolved content for a known slug.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContent(null);
      setLoading(false);
      return;
    }

    const loader = blogFiles[loaderKeyForSlug(meta.slug)];
    if (loader === undefined) {
      // index.json references a slug whose .md file is missing on disk.
      // Treat as not-found at the content level: stop loading, no content.
      setContent(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setContent(null);
    setLoading(true);

    loader().then(
      (module: { default: string }) => {
        // <--- CORRECCIÓNaquí
        if (cancelled) return;
        setContent(module.default);
        setLoading(false);
      },
      () => {
        if (cancelled) return;
        setContent(null);
        setLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [meta]);

  return {
    content,
    meta,
    notFound,
    loading,
  };
}
