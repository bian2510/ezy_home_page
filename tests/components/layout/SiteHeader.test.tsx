import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';
import SiteHeader from '@/components/layout/SiteHeader';
import { CartProvider } from '@/features/cart/CartProvider';
import { useCart } from '@/features/cart/useCart';
import { formatPrice } from '@/lib/formatPrice';
import type { ProductPricing } from '@/types';
import { buildProduct } from '../../helpers/builders';

const sampleProduct = buildProduct({ id: 'sku-001', name: 'Smart Bulb RGBW' });

// Precio del ERP: cada test fija el que necesita.
let currentPricing: ProductPricing = { price: null, transferPrice: null, availability: 'no_price' };
vi.mock('@/features/pricing/usePricing', () => ({
  usePricing: () => ({ status: 'ready', pricingOf: () => currentPricing }),
}));

function CartSeed({ quantity, children }: { quantity: number; children: ReactNode }) {
  const { addItem } = useCart();
  useEffect(() => {
    if (quantity > 0) {
      addItem(sampleProduct, quantity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
}

function LocationProbe() {
  const location = useLocation();
  return <p data-testid="location">{`${location.pathname}${location.search}`}</p>;
}

const renderHeader = (initialQuantity = 0, path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <CartProvider>
        <CartSeed quantity={initialQuantity}>
          <SiteHeader />
          <LocationProbe />
        </CartSeed>
      </CartProvider>
    </MemoryRouter>,
  );

// Un solo buscador, en la misma fila que el logo y el carrito en todos los anchos.
const firstSearchbox = () => screen.getByRole('searchbox', { name: /buscar productos/i });

const NBSP = new RegExp(' ', 'g');
const plain = (amount: number) => formatPrice(amount).replace(NBSP, ' ');

describe('SiteHeader', () => {
  beforeEach(() => {
    window.localStorage.clear();
    currentPricing = { price: null, transferPrice: null, availability: 'no_price' };
    vi.stubEnv('VITE_WHATSAPP_NUMBER', '5491100000000');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should render the EzyHome logo linking to /', () => {
    renderHeader();

    const logo = screen.getByRole('link', { name: /ezyhome/i });
    expect(logo).toHaveAttribute('href', '/');
  });

  it('should draw the black logo straight on the header, with its real proportions (no CLS)', () => {
    renderHeader();

    const img = screen.getByRole('img', { name: 'EzyHome' });
    expect(img).toHaveAttribute('src', '/images/logo/logo-white.png');
    // 141×159 px: misma proporción, para que el lugar quede reservado.
    expect(img).toHaveAttribute('width', '43');
    expect(img).toHaveAttribute('height', '48');
  });

  it('should render a single search box, named by its label and not by the placeholder', () => {
    renderHeader();

    expect(screen.getAllByRole('searchbox')).toHaveLength(1);
    expect(firstSearchbox()).toHaveAccessibleName('Buscar productos');
  });

  it.each([
    [320, 'Buscar'],
    [390, 'Buscar productos'],
    [768, 'Buscar productos (sensores, iluminación, enchufes)…'],
  ])('should fit the placeholder to the width (%i px)', (width, placeholder) => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: width >= Number(/(\d+)px/.exec(query)?.[1] ?? Infinity),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    renderHeader();

    expect(firstSearchbox()).toHaveAttribute('placeholder', placeholder);
    // El nombre no depende del placeholder.
    expect(firstSearchbox()).toHaveAccessibleName('Buscar productos');
    vi.unstubAllGlobals();
  });

  it('should fall back to the narrow placeholder without matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined);
    renderHeader();

    expect(firstSearchbox()).toHaveAttribute('placeholder', 'Buscar');
    vi.unstubAllGlobals();
  });

  it('should render the primary nav links', () => {
    renderHeader();

    const nav = screen.getByRole('navigation', { name: /principal/i });
    expect(within(nav).getByRole('link', { name: /productos/i })).toHaveAttribute(
      'href',
      '/catalogo',
    );
    expect(within(nav).getByRole('link', { name: /blog/i })).toHaveAttribute('href', '/blog');
    expect(within(nav).getByRole('link', { name: /cómo comprar/i })).toHaveAttribute(
      'href',
      '/como-comprar',
    );
  });

  it('should send "Contactanos" to the store WhatsApp', () => {
    renderHeader();

    const nav = screen.getByRole('navigation', { name: /principal/i });
    expect(within(nav).getByRole('link', { name: /contactanos/i })).toHaveAttribute(
      'href',
      'https://wa.me/5491100000000',
    );
  });

  it('should hide the cart badge when itemCount is zero', () => {
    renderHeader(0);

    expect(screen.queryByTestId('cart-badge')).toBeNull();
  });

  it('should show the item count on the cart button when the cart has items', () => {
    renderHeader(3);

    expect(screen.getByTestId('cart-badge')).toHaveTextContent('3');
    expect(screen.getByRole('button', { name: /carrito, 3 productos/i })).toBeInTheDocument();
  });

  it('should show the transfer total on the cart button when it is cheaper', () => {
    currentPricing = { price: 21000, transferPrice: 20000, availability: 'available' };
    renderHeader(2);

    const total = screen.getByTestId('cart-total');
    expect(total).toHaveTextContent(/con transferencia/i);
    expect(total).toHaveTextContent(plain(40000));
  });

  it('should not show a total while some product has no ERP price', () => {
    renderHeader(2);

    expect(screen.queryByTestId('cart-total')).not.toBeInTheDocument();
  });

  it('should search the catalog with the typed text', async () => {
    const user = userEvent.setup();
    renderHeader();

    const searchbox = firstSearchbox();
    await user.type(searchbox, 'enchufe wifi{Enter}');

    expect(screen.getByTestId('location')).toHaveTextContent('/catalogo?q=enchufe+wifi');
  });

  it('should go to the whole catalog when the search is empty', async () => {
    const user = userEvent.setup();
    renderHeader(0, '/catalogo?q=sensor');

    const searchbox = firstSearchbox();
    expect(searchbox).toHaveValue('sensor');
    await user.clear(searchbox);
    await user.type(searchbox, '{Enter}');

    expect(screen.getByTestId('location')).toHaveTextContent(/^\/catalogo$/);
  });

  it('should keep the selected category when searching from the catalog', async () => {
    const user = userEvent.setup();
    renderHeader(0, '/catalogo?category=Confort');

    await user.type(firstSearchbox(), 'wifi{Enter}');

    expect(screen.getByTestId('location')).toHaveTextContent('/catalogo?category=Confort&q=wifi');
  });

  it('should keep the category and drop the query when the search is cleared', async () => {
    const user = userEvent.setup();
    renderHeader(0, '/catalogo?category=Confort&q=sensor');

    const searchbox = firstSearchbox();
    await user.clear(searchbox);
    await user.type(searchbox, '{Enter}');

    expect(screen.getByTestId('location')).toHaveTextContent(/^\/catalogo\?category=Confort$/);
  });

  it('should not carry params from other pages into the catalog search', async () => {
    const user = userEvent.setup();
    renderHeader(0, '/blog?category=Confort');

    await user.type(firstSearchbox(), 'wifi{Enter}');

    expect(screen.getByTestId('location')).toHaveTextContent(/^\/catalogo\?q=wifi$/);
  });

  it('should open and close the mobile menu with the hamburger button', () => {
    renderHeader();

    expect(screen.queryByRole('navigation', { name: /menú móvil/i })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /abrir menú/i }));
    const menu = screen.getByRole('navigation', { name: /menú móvil/i });
    expect(within(menu).getByRole('link', { name: /productos/i })).toHaveAttribute(
      'href',
      '/catalogo',
    );

    fireEvent.click(screen.getByRole('button', { name: /cerrar menú/i }));
    expect(screen.queryByRole('navigation', { name: /menú móvil/i })).toBeNull();
  });
});
