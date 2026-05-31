import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage';

// Mock the static product dataset so tests are deterministic and isolated
// from real catalog data. Includes products with various combinations of
// `isBestseller` and `isOnSale` so we can assert section partitioning.
vi.mock('@/data/products.json', () => ({
  default: [
    {
      id: 'best-1',
      name: 'Foco Best Uno',
      description: 'Bestseller-only product.',
      price: 18900,
      images: ['/images/best-1.jpg'],
      category: 'iluminacion',
      isBestseller: true,
      isOnSale: false,
    },
    {
      id: 'best-2',
      name: 'Sensor Best Dos',
      description: 'Bestseller-only product.',
      price: 9500,
      images: ['/images/best-2.jpg'],
      category: 'seguridad',
      isBestseller: true,
      isOnSale: false,
    },
    {
      id: 'sale-1',
      name: 'Tira Oferta Uno',
      description: 'Sale-only product.',
      price: 22500,
      originalPrice: 28900,
      images: ['/images/sale-1.jpg'],
      category: 'iluminacion',
      isBestseller: false,
      isOnSale: true,
    },
    {
      id: 'sale-2',
      name: 'Camara Oferta Dos',
      description: 'Sale-only product.',
      price: 32900,
      originalPrice: 38900,
      images: ['/images/sale-2.jpg'],
      category: 'seguridad',
      isBestseller: false,
      isOnSale: true,
    },
    {
      id: 'plain-1',
      name: 'Hub Plano',
      description: 'Neither bestseller nor on sale.',
      price: 48900,
      images: ['/images/plain-1.jpg'],
      category: 'automatizacion',
      isBestseller: false,
      isOnSale: false,
    },
  ],
}));

// Stub ProductCard so the HomePage test does not need to wire up CartProvider
// (CartProvider lands at the layout level in Task 014). The stub renders just
// enough information to assert that the right products were passed in.
vi.mock('@/features/catalog/ProductCard', () => ({
  __esModule: true,
  default: ({
    product,
  }: {
    product: { id: string; name: string };
  }) => <div data-testid={`product-card-${product.id}`}>{product.name}</div>,
}));

const renderHome = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <HomePage />
    </MemoryRouter>,
  );

describe('HomePage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_WHATSAPP_NUMBER', '5491122334455');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

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

  it('should render three category cards linking to /catalogo', () => {
    renderHome();

    const heading = screen.getByRole('heading', { name: /categorías/i });
    const section = heading.closest('section')!;
    expect(section).not.toBeNull();

    const categoryLinks = within(section).getAllByRole('link');
    expect(categoryLinks).toHaveLength(3);

    expect(
      within(section).getByRole('link', { name: /iluminación/i }),
    ).toBeInTheDocument();
    expect(
      within(section).getByRole('link', { name: /automatización/i }),
    ).toBeInTheDocument();
    expect(
      within(section).getByRole('link', { name: /seguridad/i }),
    ).toBeInTheDocument();

    categoryLinks.forEach((link) => {
      expect(link.getAttribute('href')).toMatch(/^\/catalogo/);
    });
  });

  it('should render a WhatsApp CTA using VITE_WHATSAPP_NUMBER with safe link attributes', () => {
    renderHome();

    const whatsappLink = screen.getByRole('link', {
      name: /comprar por whatsapp/i,
    });
    expect(whatsappLink).toHaveAttribute(
      'href',
      'https://wa.me/5491122334455',
    );
    expect(whatsappLink).toHaveAttribute('target', '_blank');
    expect(whatsappLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
