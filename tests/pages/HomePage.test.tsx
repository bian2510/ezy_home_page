import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import type * as EnvModule from '@/lib/env';

// Mock the static product dataset so tests are deterministic and isolated
// from real catalog data. Includes products with various combinations of
// `isBestseller` and `isOnSale` so we can assert section partitioning.
// Las categorías replican la taxonomía real de `products.json`.
vi.mock('@/data/products.json', () => ({
  default: [
    {
      id: 'best-1',
      name: 'Foco Best Uno',
      description: 'Bestseller-only product.',
      price: 18900,
      images: ['/images/best-1.jpg'],
      category: 'Iluminación Inteligente',
      isBestseller: true,
      isOnSale: false,
      active: true,
    },
    {
      id: 'best-2',
      name: 'Sensor Best Dos',
      description: 'Bestseller-only product.',
      price: 9500,
      images: ['/images/best-2.jpg'],
      category: 'Seguridad',
      isBestseller: true,
      isOnSale: false,
      active: true,
    },
    {
      id: 'sale-1',
      name: 'Tira Oferta Uno',
      description: 'Sale-only product.',
      price: 28900,
      promotionalPrice: 22500,
      images: ['/images/sale-1.jpg'],
      category: 'Iluminación Inteligente',
      isBestseller: false,
      isOnSale: true,
      active: true,
    },
    {
      id: 'sale-2',
      name: 'Camara Oferta Dos',
      description: 'Sale-only product.',
      price: 38900,
      promotionalPrice: 32900,
      images: ['/images/sale-2.jpg'],
      category: 'Seguridad',
      isBestseller: false,
      isOnSale: true,
      active: true,
    },
    {
      id: 'plain-1',
      name: 'Hub Plano',
      description: 'Neither bestseller nor on sale.',
      price: 48900,
      images: ['/images/plain-1.jpg'],
      category: 'Confort',
      isBestseller: false,
      isOnSale: false,
      active: true,
    },
    {
      id: 'inactive-1',
      name: 'Termostato Inactivo',
      description: 'Inactive product, must stay hidden everywhere.',
      price: 25900,
      images: ['/images/inactive-1.jpg'],
      category: 'Hubs',
      isBestseller: true,
      isOnSale: true,
      active: false,
    },
    {
      id: 'sin-categoria-1',
      name: 'Lámpara Sin Categoría',
      description: 'Active product with no category assigned.',
      price: 7900,
      images: ['/images/sin-categoria.jpg'],
      category: null,
      isBestseller: false,
      isOnSale: false,
      active: true,
    },
  ],
}));

// Stub ProductCard so the HomePage test does not need to wire up CartProvider
// (CartProvider lands at the layout level in Task 014). The stub renders just
// enough information to assert that the right products were passed in.
vi.mock('@/features/catalog/ProductCard', () => ({
  __esModule: true,
  default: ({ product }: { product: { id: string; name: string } }) => (
    <div data-testid={`product-card-${product.id}`}>{product.name}</div>
  ),
}));

// El número de WhatsApp se lee por el accessor de entorno, nunca desde
// `process.env` (inexistente en el browser bajo Vite).
// Mock parcial: se reemplaza solo el número y el resto del módulo queda real,
// para que agregar un accessor nuevo a `lib/env` no rompa este test.
vi.mock('@/lib/env', async (importOriginal) => ({
  ...(await importOriginal<typeof EnvModule>()),
  getWhatsAppNumber: () => '5491122334455',
}));

const renderHome = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <HomePage />
    </MemoryRouter>,
  );

const categoriesSection = () =>
  screen.getByRole('heading', { name: /categorías/i }).closest('section')!;

describe('HomePage', () => {
  it('should render a hero CTA that links to /catalogo', () => {
    renderHome();

    const cta = screen.getByRole('link', { name: /ver catálogo/i });
    expect(cta).toHaveAttribute('href', '/catalogo');
  });

  it('should render a "Más vendidos" section containing only bestseller products', () => {
    renderHome();

    const heading = screen.getByRole('heading', { name: /más vendidos/i });
    const section = heading.closest('section')!;
    expect(section).not.toBeNull();

    expect(within(section).getByText('Foco Best Uno')).toBeInTheDocument();
    expect(within(section).getByText('Sensor Best Dos')).toBeInTheDocument();
    expect(within(section).queryByText('Tira Oferta Uno')).toBeNull();
    expect(within(section).queryByText('Hub Plano')).toBeNull();
  });

  it('should render an "Ofertas" section containing only on-sale products', () => {
    renderHome();

    const heading = screen.getByRole('heading', { name: /^ofertas$/i });
    const section = heading.closest('section')!;
    expect(section).not.toBeNull();

    expect(within(section).getByText('Tira Oferta Uno')).toBeInTheDocument();
    expect(within(section).getByText('Camara Oferta Dos')).toBeInTheDocument();
    expect(within(section).queryByText('Foco Best Uno')).toBeNull();
    expect(within(section).queryByText('Hub Plano')).toBeNull();
  });

  it('should exclude inactive products from "Más vendidos" and "Ofertas" even when flagged as bestseller/on sale', () => {
    renderHome();

    expect(screen.queryByText('Termostato Inactivo')).not.toBeInTheDocument();
  });

  it('should render one category card per category present in the active catalog', () => {
    renderHome();

    const links = within(categoriesSection()).getAllByRole('link');

    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Iluminación Inteligente',
      'Seguridad',
      'Confort',
    ]);
  });

  it('should link each category card to the catalog filtered by that category', () => {
    renderHome();

    expect(within(categoriesSection()).getByRole('link', { name: 'Seguridad' })).toHaveAttribute(
      'href',
      '/catalogo?category=Seguridad',
    );
    expect(
      within(categoriesSection()).getByRole('link', { name: 'Iluminación Inteligente' }),
    ).toHaveAttribute(
      'href',
      `/catalogo?category=${encodeURIComponent('Iluminación Inteligente')}`,
    );
  });

  it('should not render a category card for a category that only inactive products use', () => {
    renderHome();

    expect(
      within(categoriesSection()).queryByRole('link', { name: 'Hubs' }),
    ).not.toBeInTheDocument();
  });

  it('should render a WhatsApp CTA using the configured number with safe link attributes', () => {
    renderHome();

    const whatsappLink = screen.getByRole('link', {
      name: /comprar por whatsapp/i,
    });
    expect(whatsappLink).toHaveAttribute('href', 'https://wa.me/5491122334455');
    expect(whatsappLink).toHaveAttribute('target', '_blank');
    expect(whatsappLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
