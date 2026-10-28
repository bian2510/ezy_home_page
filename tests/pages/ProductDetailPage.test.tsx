import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductDetailPage from '@/pages/ProductDetailPage';
import { CartProvider } from '@/features/cart/CartProvider';
import { formatPrice } from '@/lib/formatPrice';
import type { ProductPricing } from '@/types';

vi.mock('@/data/products.json', () => ({
  default: [
    {
      id: 'p-1',
      name: 'Foco Inteligente RGBW',
      description: 'Foco LED inteligente con 16 millones de colores.',
      price: 18900,
      images: ['/images/foco-1.jpg', '/images/foco-2.jpg'],
      category: 'iluminacion',
      isBestseller: true,
      active: true,
    },
    {
      id: 'p-2',
      name: 'Tira LED RGB',
      description: 'Tira LED de 5 metros para iluminación ambiental.',
      price: 28900,
      images: ['/images/tira-led.jpg'],
      category: 'iluminacion',
      isBestseller: false,
      active: true,
    },
    {
      id: 'p-3',
      name: 'Sensor Sin Imagen',
      description: 'Producto sin imágenes para probar placeholder.',
      price: 9500,
      images: [],
      category: 'seguridad',
      isBestseller: false,
      active: true,
    },
    {
      id: 'p-4',
      name: 'Cerradura Inactiva',
      description: 'Producto sin stock, oculto del storefront.',
      price: 15900,
      images: ['/images/cerradura.jpg'],
      category: 'seguridad',
      isBestseller: false,
      active: false,
    },
  ],
}));

const addItemMock = vi.fn();

vi.mock('@/features/cart/useCart', () => ({
  useCart: () => ({
    items: [],
    addItem: addItemMock,
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
    total: 0,
    itemCount: 0,
    storageAvailable: true,
  }),
}));

// Precio del ERP: por defecto el `price` del JSON mockeado hace de precio del
// ERP; cada test puede fijar otro.
let erpPricing: ProductPricing | null = null;
vi.mock('@/features/pricing/usePricing', () => ({
  usePricing: () => ({
    status: 'ready',
    pricingOf: (product: { price: number }) =>
      erpPricing ?? { price: product.price, transferPrice: null, availability: 'available' },
  }),
}));

vi.mock('@/features/toast/useToast', () => ({
  useToast: () => ({ addToast: vi.fn(), removeToast: vi.fn(), toasts: [] }),
}));

// `formatPrice` (Intl es-AR) emits a non-breaking space between currency
// symbol and amount; Testing Library's default normaliser collapses ASCII
// whitespace but preserves U+00A0. This matcher compares ignoring all
// Unicode whitespace.
const priceText = (amount: number) => {
  const expected = formatPrice(amount).replace(/\s+/g, '');
  return (content: string) => content.replace(/\s+/g, '') === expected;
};

const offers = () => {
  const script = document.head.querySelector('script[type="application/ld+json"]');
  const datos = JSON.parse(script?.textContent ?? '{}') as {
    offers?: { price: string; availability: string };
  };
  return datos.offers;
};

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <CartProvider>
        <Routes>
          <Route path="/productos/:id" element={<ProductDetailPage />} />
        </Routes>
      </CartProvider>
    </MemoryRouter>,
  );

describe('ProductDetailPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    addItemMock.mockClear();
  });

  afterEach(() => {
    window.localStorage.clear();
    erpPricing = null;
  });

  it('should render the product name and price for a valid id', () => {
    renderAt('/productos/p-1');

    expect(
      screen.getByRole('heading', { name: /foco inteligente rgbw/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(priceText(18900))).toBeInTheDocument();
  });

  it('should render the full product description for a valid id', () => {
    renderAt('/productos/p-1');

    expect(
      screen.getByText(/foco led inteligente con 16 millones de colores/i),
    ).toBeInTheDocument();
  });

  it('should show the ERP price and the transfer price instead of the JSON price', () => {
    erpPricing = { price: 31000, transferPrice: 29500, availability: 'available' };
    renderAt('/productos/p-2');

    expect(screen.getByText(priceText(31000))).toBeInTheDocument();
    expect(screen.getByText(priceText(29500))).toBeInTheDocument();
    expect(screen.queryByText(priceText(28900))).not.toBeInTheDocument();
  });

  it('should offer a WhatsApp consult instead of adding to the cart when out of stock', () => {
    erpPricing = { price: 31000, transferPrice: null, availability: 'out_of_stock' };
    renderAt('/productos/p-2');

    expect(screen.getByText(/sin stock/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /agregar al carrito/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /consultar por whatsapp/i })).toBeInTheDocument();
  });

  it('should ask to consult the price when the ERP has none', () => {
    erpPricing = { price: null, transferPrice: null, availability: 'no_price' };
    renderAt('/productos/p-2');

    expect(screen.getByText('Consultar precio')).toBeInTheDocument();
    expect(screen.queryByText(priceText(28900))).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /consultar por whatsapp/i })).toBeInTheDocument();
  });

  it('should disable "Agregar al carrito" while the price is loading', () => {
    erpPricing = { price: null, transferPrice: null, availability: 'loading' };
    renderAt('/productos/p-2');

    expect(screen.getByRole('status', { name: /cargando precio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /agregar al carrito/i })).toBeDisabled();
  });

  it('should publish the ERP price and stock in the JSON-LD, so Google matches the page', () => {
    erpPricing = { price: 31000, transferPrice: null, availability: 'out_of_stock' };
    renderAt('/productos/p-2');

    expect(offers()).toMatchObject({
      price: '31000',
      availability: 'https://schema.org/OutOfStock',
    });
  });

  it('should fall back to the JSON price in the JSON-LD only when the ERP has no price', () => {
    erpPricing = { price: null, transferPrice: null, availability: 'no_price' };
    renderAt('/productos/p-2');

    expect(offers()).toMatchObject({ price: '28900', availability: 'https://schema.org/InStock' });
  });

  it('should render a thumbnail strip when the product has more than one image', () => {
    renderAt('/productos/p-1');

    const thumbs = screen.getAllByRole('button', { name: /imagen \d/i });
    expect(thumbs.length).toBe(2);
  });

  it('should render a placeholder when the product has no images', () => {
    renderAt('/productos/p-3');

    expect(screen.getByRole('img', { name: /sin imagen/i })).toBeInTheDocument();
  });

  it('should show a 404 message and a link to /catalogo when the id does not match any product', () => {
    renderAt('/productos/does-not-exist');

    expect(screen.getByText(/404/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /volver al catálogo/i });
    expect(link).toHaveAttribute('href', '/catalogo');
  });

  it('should show the same 404 message when the matching product is inactive (out of stock)', () => {
    renderAt('/productos/p-4');

    expect(screen.getByText(/404/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /volver al catálogo/i });
    expect(link).toHaveAttribute('href', '/catalogo');
  });

  it('should start the QuantitySelector at 1 with the decrement button disabled', () => {
    renderAt('/productos/p-1');

    const decrement = screen.getByRole('button', { name: /disminuir cantidad/i });
    const increment = screen.getByRole('button', { name: /aumentar cantidad/i });
    const quantityRegion = decrement.parentElement!;
    expect(within(quantityRegion).getByText('1')).toBeInTheDocument();
    expect(decrement).toBeDisabled();
    expect(increment).not.toBeDisabled();
  });

  it('should call addItem with the product and the selected quantity when "Agregar al carrito" is clicked', async () => {
    const user = userEvent.setup();
    renderAt('/productos/p-1');

    const increment = screen.getByRole('button', { name: /aumentar cantidad/i });
    await user.click(increment);
    await user.click(increment);

    const addButton = screen.getByRole('button', { name: /agregar al carrito/i });
    await user.click(addButton);

    expect(addItemMock).toHaveBeenCalledTimes(1);
    expect(addItemMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'p-1', name: 'Foco Inteligente RGBW' }),
      3,
    );
  });
});
