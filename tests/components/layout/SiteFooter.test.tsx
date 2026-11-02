// SiteFooter — footer global.
//
// Verifica: la marca, el año, la navegación secundaria, las categorías reales
// del catálogo y el contacto por WhatsApp solo si hay número configurado.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SiteFooter from '@/components/layout/SiteFooter';

vi.mock('@/data/products.json', () => ({
  default: [
    {
      id: '1',
      sku: 'A',
      name: 'Enchufe',
      description: '',
      images: [],
      category: 'Confort',
      isBestseller: false,
      active: true,
    },
    {
      id: '2',
      sku: 'B',
      name: 'Cerradura',
      description: '',
      images: [],
      category: 'Cerraduras',
      isBestseller: false,
      active: false,
    },
  ],
}));

const renderFooter = () =>
  render(
    <MemoryRouter>
      <SiteFooter />
    </MemoryRouter>,
  );

describe('SiteFooter', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should render the EzyHome business name', () => {
    renderFooter();

    expect(screen.getAllByText(/ezyhome/i).length).toBeGreaterThan(0);
  });

  it('should display the current copyright year', () => {
    renderFooter();

    const year = String(new Date().getFullYear());
    expect(screen.getByText((content) => content.includes(year))).toBeInTheDocument();
  });

  it('should expose secondary nav links to /catalogo and /blog', () => {
    renderFooter();

    const nav = screen.getByRole('navigation', { name: /pie de página/i });
    expect(within(nav).getByRole('link', { name: /productos/i })).toHaveAttribute(
      'href',
      '/catalogo',
    );
    expect(within(nav).getByRole('link', { name: /blog/i })).toHaveAttribute('href', '/blog');
  });

  it('should link only the categories of visible products to the filtered catalog', () => {
    renderFooter();

    const categories = screen.getByRole('navigation', { name: /categorías/i });
    expect(within(categories).getByRole('link', { name: 'Confort' })).toHaveAttribute(
      'href',
      '/catalogo?category=Confort',
    );
    expect(within(categories).queryByRole('link', { name: 'Cerraduras' })).toBeNull();
  });

  it('should offer the store WhatsApp when the number is configured', () => {
    vi.stubEnv('VITE_WHATSAPP_NUMBER', '5491100000000');
    renderFooter();

    expect(screen.getByRole('link', { name: /whatsapp/i })).toHaveAttribute(
      'href',
      'https://wa.me/5491100000000',
    );
  });

  it('should not show a dead WhatsApp link when there is no number', () => {
    vi.stubEnv('VITE_WHATSAPP_NUMBER', '');
    renderFooter();

    expect(screen.queryByRole('link', { name: /whatsapp/i })).toBeNull();
  });

  it('should show the store email, phone and location', () => {
    renderFooter();

    expect(screen.getByRole('link', { name: 'contacto.ezyhome@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:contacto.ezyhome@gmail.com',
    );
    expect(screen.getByRole('link', { name: '+54 9 11 24741036' })).toHaveAttribute(
      'href',
      'tel:+5491124741036',
    );
    expect(screen.getByText('CABA, Argentina')).toBeInTheDocument();
  });
});
