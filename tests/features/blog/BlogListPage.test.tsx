import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type * as RRD from 'react-router-dom';

// Mock src/data/blog/index.json with deterministic fixtures so the test does
// not depend on whatever real articles ship in the repo. One article has a
// cover image; the other has `image: null` to exercise the "no img element"
// branch from the acceptance criteria.
vi.mock('@/data/blog/index.json', () => ({
  default: [
    {
      slug: 'articulo-con-imagen',
      title: 'Artículo con imagen de portada',
      date: '2026-05-01',
      image: '/images/blog/con-imagen.jpg',
      excerpt: 'Resumen del artículo con imagen.',
    },
    {
      slug: 'articulo-sin-imagen',
      title: 'Artículo sin imagen',
      date: '2026-05-15',
      image: null,
      excerpt: 'Resumen del artículo sin imagen.',
    },
  ],
}));

// Keep MemoryRouter real, replace useNavigate with a spy so the click
// assertion does not depend on the route table.
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof RRD>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

import BlogListPage from '@/features/blog/BlogListPage';

const renderPage = () =>
  render(
    <MemoryRouter>
      <BlogListPage />
    </MemoryRouter>,
  );

describe('BlogListPage', () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it('should render the page heading "Blog" at level 1', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: /^blog$/i, level: 1 })).toBeInTheDocument();
  });

  it('should render every article title from index.json', () => {
    renderPage();

    expect(screen.getByText('Artículo con imagen de portada')).toBeInTheDocument();
    expect(screen.getByText('Artículo sin imagen')).toBeInTheDocument();
  });

  it('should render a lazy-loaded img for an article whose image is not null', () => {
    renderPage();

    const img = screen.getByRole('img', {
      name: /artículo con imagen de portada/i,
    });
    expect(img).toHaveAttribute('src', '/images/blog/con-imagen.jpg');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('should render no img element inside the card whose article.image is null', () => {
    renderPage();

    // Scope the "no img" assertion to the card for the image-less article so
    // the sibling card's img does not produce a false negative.
    const sinImagenTitle = screen.getByText('Artículo sin imagen');
    const card = sinImagenTitle.closest('article');
    expect(card).not.toBeNull();
    expect(card?.querySelector('img')).toBeNull();
  });

  it('should format the article date in es-AR long form', () => {
    renderPage();

    // `new Date('2026-05-01').toLocaleDateString('es-AR', { … })` →
    // "1 de mayo de 2026". Match loosely on the substring to stay robust to
    // ICU variations across Node versions.
    expect(screen.getByText(/1 de mayo de 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/15 de mayo de 2026/i)).toBeInTheDocument();
  });

  it('should navigate to /blog/:slug when an article card is clicked', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('Artículo con imagen de portada'));

    expect(navigateMock).toHaveBeenCalledWith('/blog/articulo-con-imagen');
  });
});
