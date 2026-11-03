import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import type * as EnvModule from '@/lib/env';

// Catálogo de prueba: las categorías replican la taxonomía real de
// `products.json`. `isBestseller` marca la selección curada que el Home muestra
// como "Nuestros productos" (sin datos de ventas, no se rotula "más vendido").
vi.mock('@/data/products.json', () => ({
  default: [
    {
      id: 'luz-1',
      name: 'Foco Destacado Uno',
      description: '',
      images: ['/images/luz-1.jpg'],
      category: 'Iluminación Inteligente',
      isBestseller: true,
      active: true,
    },
    {
      id: 'seg-1',
      name: 'Sensor Destacado Dos',
      description: '',
      images: ['/images/seg-1.jpg'],
      category: 'Seguridad',
      isBestseller: true,
      active: true,
    },
    {
      id: 'luz-2',
      name: 'Tira Común',
      description: '',
      images: ['/images/luz-2.jpg'],
      category: 'Iluminación Inteligente',
      isBestseller: false,
      active: true,
    },
    {
      id: 'seg-2',
      name: 'Cámara Común',
      description: '',
      images: ['/images/seg-2.jpg'],
      category: 'Seguridad',
      isBestseller: false,
      active: true,
    },
    {
      id: 'confort-1',
      name: 'Motor Destacado Tres',
      description: '',
      images: ['/images/confort-1.jpg'],
      category: 'Confort',
      isBestseller: true,
      active: true,
    },
    {
      id: 'inactivo-1',
      name: 'Termostato Inactivo',
      description: '',
      images: ['/images/inactivo-1.jpg'],
      category: 'Hubs',
      isBestseller: true,
      active: false,
    },
  ],
}));

// ProductCard real necesita carrito, precios y toasts: acá alcanza con saber
// qué productos recibió. Su comportamiento se prueba en su propio test.
vi.mock('@/features/catalog/ProductCard', () => ({
  __esModule: true,
  default: ({ product }: { product: { id: string; name: string } }) => (
    <div data-testid={`product-card-${product.id}`}>{product.name}</div>
  ),
}));

// Mock parcial: solo el número de WhatsApp; el resto de `lib/env` queda real.
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

const sectionOf = (heading: RegExp) =>
  screen.getByRole('heading', { name: heading }).closest('section')!;

describe('HomePage', () => {
  describe('hero', () => {
    it('should render the page H1', () => {
      renderHome();

      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /transformá tu hogar en un espacio inteligente y conectado/i,
        }),
      ).toBeInTheDocument();
    });

    it('should link "Ver productos" to the catalog', () => {
      renderHome();

      expect(screen.getByRole('link', { name: /ver productos/i })).toHaveAttribute(
        'href',
        '/catalogo',
      );
    });

    it('should open WhatsApp from "Contactanos" with safe link attributes', () => {
      renderHome();

      const contact = screen.getByRole('link', { name: /contactanos/i });
      expect(contact).toHaveAttribute('href', 'https://wa.me/5491122334455');
      expect(contact).toHaveAttribute('target', '_blank');
      expect(contact).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should show only the highlights the owner confirmed', () => {
      renderHome();

      expect(screen.getByText(/alexa y google home/i)).toBeInTheDocument();
      expect(screen.getByText(/hasta un 30%/i)).toBeInTheDocument();
    });
  });

  describe('Nuestros productos', () => {
    it('should show the curated selection and not the rest of the catalog', () => {
      renderHome();

      const section = sectionOf(/nuestros productos/i);
      expect(within(section).getByText('Foco Destacado Uno')).toBeInTheDocument();
      expect(within(section).getByText('Sensor Destacado Dos')).toBeInTheDocument();
      expect(within(section).getByText('Motor Destacado Tres')).toBeInTheDocument();
      expect(within(section).queryByText('Tira Común')).toBeNull();
    });

    it('should never show an inactive product', () => {
      renderHome();

      expect(screen.queryByText('Termostato Inactivo')).not.toBeInTheDocument();
    });

    it('should not label the selection as best sellers: there is no sales data', () => {
      renderHome();

      expect(screen.queryByText(/más vendid|más elegid/i)).not.toBeInTheDocument();
    });

    it('should filter the selection with the category chips', async () => {
      const user = userEvent.setup();
      renderHome();
      const section = sectionOf(/nuestros productos/i);

      await user.click(within(section).getByRole('button', { name: /^seguridad/i }));

      expect(within(section).getByText('Sensor Destacado Dos')).toBeInTheDocument();
      expect(within(section).queryByText('Foco Destacado Uno')).toBeNull();
      expect(within(section).getByRole('button', { name: /^seguridad/i })).toHaveAttribute(
        'aria-pressed',
        'true',
      );

      await user.click(within(section).getByRole('button', { name: /^todos/i }));

      expect(within(section).getByText('Foco Destacado Uno')).toBeInTheDocument();
    });

    it('should link "Ver todos" to the full catalog', () => {
      renderHome();

      expect(
        within(sectionOf(/nuestros productos/i)).getByRole('link', { name: /ver todos/i }),
      ).toHaveAttribute('href', '/catalogo');
    });
  });

  describe('categorías', () => {
    const categoriesSection = () => sectionOf(/soluciones para cada rincón de tu casa/i);

    it('should render one card per active category, with its real product count', () => {
      renderHome();

      const links = within(categoriesSection()).getAllByRole('link');
      expect(links.map((link) => link.getAttribute('href'))).toEqual([
        `/catalogo?category=${encodeURIComponent('Iluminación Inteligente')}`,
        '/catalogo?category=Seguridad',
        '/catalogo?category=Confort',
      ]);
      expect(within(links[0]!).getByText('Ver 2 productos')).toBeInTheDocument();
      expect(within(links[2]!).getByText('Ver 1 producto')).toBeInTheDocument();
    });

    it('should not render a card for a category only inactive products use', () => {
      renderHome();

      expect(within(categoriesSection()).queryByText('Hubs')).not.toBeInTheDocument();
    });
  });

  describe('beneficios y cómo funciona', () => {
    it('should name only the voice assistants the products work with', () => {
      renderHome();

      expect(screen.getByText(/google assistant y amazon alexa/i)).toBeInTheDocument();
      expect(screen.queryByText(/siri/i)).not.toBeInTheDocument();
    });

    it('should describe the three steps and the connectivity supported', () => {
      renderHome();

      const section = sectionOf(/cómo funciona ezyhome en tu día a día/i);
      expect(within(section).getAllByRole('heading', { level: 3 })).toHaveLength(3);
      expect(within(section).getByText(/smart life o tuya smart/i)).toBeInTheDocument();
      expect(within(section).getByText(/wi-fi 2\.4 ghz, zigbee y bluetooth/i)).toBeInTheDocument();
    });

    it('should show the "Modo Cine" routine example', () => {
      renderHome();

      expect(screen.getByRole('heading', { name: /modo cine/i })).toBeInTheDocument();
      expect(screen.getByText(/persianas con motor/i)).toBeInTheDocument();
    });
  });
});
