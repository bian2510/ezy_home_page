import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// Mock the blog-file loader map that useBlogPost consumes. Vitest cannot
// resolve Vite's `import.meta.glob` against .md raw imports in the jsdom
// environment, so we isolate that Vite-specific concern behind a tiny
// `blogFiles` module and mock it here. The hook itself is tested against
// its public contract: { content, meta, notFound, loading }.
vi.mock('@/features/blog/blogFiles', () => {
  const loaders: Record<string, () => Promise<{ default: string }>> = {
    '../../data/blog/introduccion-a-la-domotica.md': () =>
      Promise.resolve({ default: '# Introducción a la Domótica\n\nContenido.' }),
    '../../data/blog/iluminacion-inteligente-guia.md': () =>
      Promise.resolve({ default: '# Iluminación inteligente\n\nGuía.' }),
  };
  return { blogFiles: loaders };
});

import { useBlogPost } from '@/features/blog/useBlogPost';

describe('useBlogPost', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return notFound true synchronously when the slug is not in index.json', () => {
    const { result } = renderHook(() => useBlogPost('no-existe'));

    expect(result.current.notFound).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.content).toBeNull();
    expect(result.current.meta).toBeNull();
  });

  it('should expose the index.json meta for a known slug while content is still loading', async () => {
    const { result } = renderHook(() =>
      useBlogPost('introduccion-a-la-domotica'),
    );

    expect(result.current.notFound).toBe(false);
    expect(result.current.meta).not.toBeNull();
    expect(result.current.meta?.slug).toBe('introduccion-a-la-domotica');
    expect(result.current.meta?.title).toBe(
      'Introducción a la Domótica: ¿Qué es y para qué sirve?',
    );

    // Drain the pending dynamic-import promise so React's act() check is
    // satisfied. The assertion above is the actual subject under test.
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should eventually resolve the raw markdown content for a known slug', async () => {
    const { result } = renderHook(() =>
      useBlogPost('introduccion-a-la-domotica'),
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.content).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.content).toBe(
      '# Introducción a la Domótica\n\nContenido.',
    );
    expect(result.current.notFound).toBe(false);
    expect(result.current.meta?.slug).toBe('introduccion-a-la-domotica');
  });

  it('should resolve a different markdown body when the slug changes', async () => {
    const { result, rerender } = renderHook(({ slug }) => useBlogPost(slug), {
      initialProps: { slug: 'introduccion-a-la-domotica' },
    });

    await waitFor(() => {
      expect(result.current.content).toBe(
        '# Introducción a la Domótica\n\nContenido.',
      );
    });

    rerender({ slug: 'iluminacion-inteligente-guia' });

    await waitFor(() => {
      expect(result.current.content).toBe(
        '# Iluminación inteligente\n\nGuía.',
      );
    });
    expect(result.current.meta?.slug).toBe('iluminacion-inteligente-guia');
    expect(result.current.notFound).toBe(false);
  });

  it('should transition back to notFound true when the slug changes from known to unknown', async () => {
    const { result, rerender } = renderHook(({ slug }) => useBlogPost(slug), {
      initialProps: { slug: 'introduccion-a-la-domotica' },
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    rerender({ slug: 'no-existe' });

    expect(result.current.notFound).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.content).toBeNull();
    expect(result.current.meta).toBeNull();
  });
});
