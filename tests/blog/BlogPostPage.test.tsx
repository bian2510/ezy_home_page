import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock the data hook so the page is exercised against its public contract
// rather than the static Markdown + index.json on disk. The hook itself is
// covered by `tests/blog/useBlogPost.test.ts`.
vi.mock('@/features/blog/useBlogPost', () => ({
  useBlogPost: vi.fn(),
}));

import { useBlogPost } from '@/features/blog/useBlogPost';
import BlogPostPage from '@/features/blog/BlogPostPage';

const mockedUseBlogPost = vi.mocked(useBlogPost);

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/blog/:slug" element={<BlogPostPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe('BlogPostPage', () => {
  beforeEach(() => {
    mockedUseBlogPost.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the article title for a known slug when content has loaded', () => {
    mockedUseBlogPost.mockReturnValue({
      content: '# Hola mundo\n\nContenido del artículo.',
      meta: {
        slug: 'test',
        title: 'Mi Artículo',
        date: '2026-05-01',
        image: null,
      },
      notFound: false,
      loading: false,
    });

    renderAt('/blog/test');

    expect(screen.getByRole('heading', { name: 'Mi Artículo', level: 1 })).toBeInTheDocument();
  });

  it('should render the Markdown body via ReactMarkdown when content has loaded', () => {
    mockedUseBlogPost.mockReturnValue({
      content: '# Encabezado interno\n\nUn párrafo de prueba.',
      meta: {
        slug: 'test',
        title: 'Mi Artículo',
        date: '2026-05-01',
        image: null,
      },
      notFound: false,
      loading: false,
    });

    renderAt('/blog/test');

    // The article H1 (level 1) is the meta.title; the Markdown body's `#`
    // renders as an H2 to keep document outline single-H1.
    expect(
      screen.getByRole('heading', { name: 'Encabezado interno', level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Un párrafo de prueba.')).toBeInTheDocument();
  });

  it('should not render raw HTML embedded in Markdown content (rehypeRaw disabled)', () => {
    mockedUseBlogPost.mockReturnValue({
      content: '<script data-testid="evil">alert(1)</script>\n\nTexto seguro.',
      meta: {
        slug: 'test',
        title: 'Mi Artículo',
        date: '2026-05-01',
        image: null,
      },
      notFound: false,
      loading: false,
    });

    renderAt('/blog/test');

    expect(screen.queryByTestId('evil')).not.toBeInTheDocument();
    expect(document.querySelector('article script')).not.toBeInTheDocument();
  });

  it('should render the publication date formatted in es-AR locale above the Markdown body', () => {
    mockedUseBlogPost.mockReturnValue({
      content: '# Body',
      meta: {
        slug: 'test',
        title: 'Mi Artículo',
        date: '2026-05-01',
        image: null,
      },
      notFound: false,
      loading: false,
    });

    renderAt('/blog/test');

    const expected = new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date('2026-05-01'));

    const time = screen.getByText(expected);
    expect(time).toBeInTheDocument();
    expect(time.tagName.toLowerCase()).toBe('time');
    expect(time).toHaveAttribute('dateTime', '2026-05-01');
  });

  it('should render a loading indicator while loading is true', () => {
    mockedUseBlogPost.mockReturnValue({
      content: null,
      meta: {
        slug: 'test',
        title: 'Mi Artículo',
        date: '2026-05-01',
        image: null,
      },
      notFound: false,
      loading: true,
    });

    renderAt('/blog/test');

    expect(screen.getByRole('status')).toHaveTextContent(/cargando/i);
  });

  it('should render a 404 message and a link back to /blog when notFound is true', () => {
    mockedUseBlogPost.mockReturnValue({
      content: null,
      meta: null,
      notFound: true,
      loading: false,
    });

    renderAt('/blog/no-existe');

    expect(screen.getByText(/404/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /volver al blog/i });
    expect(link).toHaveAttribute('href', '/blog');
  });
});
