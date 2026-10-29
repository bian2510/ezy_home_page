import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type * as RRD from 'react-router-dom';
import type { ReactElement } from 'react';
import type { CartItem, Product, ProductPricing } from '@/types';
import { formatPrice } from '@/lib/formatPrice';
import ProductCard from '@/features/catalog/ProductCard';
import { CartProvider } from '@/features/cart/CartProvider';
import { buildProduct as buildBaseProduct } from '../../helpers/builders';

// Intl.NumberFormat for es-AR currency emits non-breaking spaces (U+00A0)
// between symbol and digits. Testing Library's default normalizer trims and
// collapses ASCII whitespace only, so we normalize NBSPs to regular spaces
// before comparing element text content. We also restrict matches to the
// deepest element so that ancestor wrappers (whose textContent transitively
// equals the price) do not produce a "multiple matches" error.
const NBSP_REGEX = new RegExp('\u00a0', 'g');
const normalizePrice = (text: string) => text.replace(NBSP_REGEX, ' ').trim();
const matchesPrice = (amount: number) => {
  const expected = normalizePrice(formatPrice(amount));
  return (_content: string, node: Element | null) => {
    if (!node) return false;
    if (normalizePrice(node.textContent ?? '') !== expected) return false;
    const childMatch = Array.from(node.children).some(
      (child) => normalizePrice(child.textContent ?? '') === expected,
    );
    return !childMatch;
  };
};

// react-router-dom: keep MemoryRouter real, replace useNavigate with a spy.
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof RRD>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// useCart: replace with a spy on addItem so we can assert the click handler
// invokes the cart contract without rendering the real provider tree.
const addItemMock = vi.fn();
let cartItems: CartItem[] = [];
vi.mock('@/features/cart/useCart', () => ({
  useCart: () => ({
    items: cartItems,
    addItem: addItemMock,
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
    total: 0,
    itemCount: 0,
    storageAvailable: true,
  }),
}));

// usePricing: el precio de venta viene del ERP; cada test fija el que necesita.
const AVAILABLE: ProductPricing = { price: 12500, transferPrice: null, availability: 'available' };
let currentPricing: ProductPricing = AVAILABLE;
vi.mock('@/features/pricing/usePricing', () => ({
  usePricing: () => ({ status: 'ready', pricingOf: () => currentPricing }),
}));

const addToastMock = vi.fn();
vi.mock('@/features/toast/useToast', () => ({
  useToast: () => ({ addToast: addToastMock, removeToast: vi.fn(), toasts: [] }),
}));

const buildProduct = (overrides: Partial<Product> = {}): Product =>
  buildBaseProduct({ name: 'Foco Inteligente RGBW', ...overrides });

const renderWithProviders = (ui: ReactElement) =>
  render(
    <MemoryRouter>
      <CartProvider>{ui}</CartProvider>
    </MemoryRouter>,
  );

describe('ProductCard', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    addItemMock.mockReset();
    addToastMock.mockReset();
    currentPricing = AVAILABLE;
    cartItems = [];
    window.localStorage.clear();
  });

  it('should block adding more units once the cart has all the ERP stock', () => {
    const product = buildProduct();
    currentPricing = { ...AVAILABLE, stock: 2 };
    cartItems = [{ product, quantity: 2 }];

    renderWithProviders(<ProductCard product={product} />);

    expect(screen.getByRole('button', { name: /agregar al carrito/i })).toBeDisabled();
    expect(screen.getByText(/llegaste al máximo de unidades disponibles/i)).toBeInTheDocument();
    expect(screen.queryByText(/quedan/i)).not.toBeInTheDocument();
  });

  it('should still let the visitor add while the cart is under the ERP stock', () => {
    const product = buildProduct();
    currentPricing = { ...AVAILABLE, stock: 2 };
    cartItems = [{ product, quantity: 1 }];

    renderWithProviders(<ProductCard product={product} />);

    expect(screen.getByRole('button', { name: /agregar al carrito/i })).toBeEnabled();
    expect(screen.queryByText(/llegaste al máximo/i)).not.toBeInTheDocument();
  });

  it('should render the product name and the ERP price', () => {
    currentPricing = { price: 21000, transferPrice: null, availability: 'available' };
    const product = buildProduct({ name: 'Foco Inteligente RGBW' });

    renderWithProviders(<ProductCard product={product} />);

    expect(screen.getByText('Foco Inteligente RGBW')).toBeInTheDocument();
    expect(screen.getByText(matchesPrice(21000))).toBeInTheDocument();
  });

  it('should show the transfer price as the main price and Mercado Pago below when it is lower', () => {
    currentPricing = { price: 21000, transferPrice: 20000, availability: 'available' };

    renderWithProviders(<ProductCard product={buildProduct()} />);

    expect(screen.getByTestId('main-price')).toHaveTextContent(/con transferencia/i);
    expect(screen.getByTestId('main-price')).toHaveTextContent(normalizePrice(formatPrice(20000)));
    expect(screen.getByTestId('secondary-price')).toHaveTextContent(/con mercado pago/i);
    expect(screen.getByTestId('secondary-price')).toHaveTextContent(
      normalizePrice(formatPrice(21000)),
    );
  });

  it('should show a single price without labels when transfer is not cheaper', () => {
    currentPricing = { price: 21000, transferPrice: null, availability: 'available' };

    renderWithProviders(<ProductCard product={buildProduct()} />);

    expect(screen.getByTestId('main-price')).toHaveTextContent(normalizePrice(formatPrice(21000)));
    expect(screen.queryByTestId('secondary-price')).not.toBeInTheDocument();
  });

  it('should show a skeleton and a disabled add button while the ERP answer is loading', () => {
    currentPricing = { price: null, transferPrice: null, availability: 'loading' };

    renderWithProviders(<ProductCard product={buildProduct()} />);

    expect(screen.getByRole('status', { name: /cargando precio/i })).toBeInTheDocument();
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /agregar al carrito/i })).toBeDisabled();
  });

  it('should ask to consult the price by WhatsApp when the ERP has no price for it', () => {
    currentPricing = { price: null, transferPrice: null, availability: 'no_price' };

    renderWithProviders(<ProductCard product={buildProduct({ name: 'Foco' })} />);

    expect(screen.getByText('Consultar precio')).toBeInTheDocument();
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /agregar al carrito/i })).not.toBeInTheDocument();
    const consult = screen.getByRole('link', { name: /consultar por whatsapp/i });
    expect(consult).toHaveAttribute('href', expect.stringContaining('https://wa.me/'));
    expect(decodeURIComponent(consult.getAttribute('href') ?? '')).toContain('Foco');
  });

  it('should show "Sin stock" and offer to consult instead of adding to the cart', async () => {
    const user = userEvent.setup();
    currentPricing = { price: 21000, transferPrice: null, availability: 'out_of_stock' };

    renderWithProviders(<ProductCard product={buildProduct()} />);

    expect(screen.getByText(/sin stock/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /agregar al carrito/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: /consultar por whatsapp/i }));
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('should render the first image with loading="lazy" when images is non-empty', () => {
    const product = buildProduct({
      name: 'Foco',
      images: ['/images/foco-1.jpg', '/images/foco-2.jpg'],
    });

    renderWithProviders(<ProductCard product={product} />);

    const img = screen.getByRole('img', { name: /foco/i });
    expect(img).toHaveAttribute('src', '/images/foco-1.jpg');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('should show the "Sin imagen" placeholder and no img element when images is empty', () => {
    const product = buildProduct({ images: [] });

    renderWithProviders(<ProductCard product={product} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText(/sin imagen/i)).toBeInTheDocument();
  });

  it('should show the "Más vendido" badge when isBestseller is true', () => {
    const product = buildProduct({ isBestseller: true });

    renderWithProviders(<ProductCard product={product} />);

    expect(screen.getByText(/más vendido/i)).toBeInTheDocument();
  });

  it('should navigate to /productos/:id when the card body is clicked', async () => {
    const user = userEvent.setup();
    const product = buildProduct({ id: 'abc-123', name: 'Foco' });

    renderWithProviders(<ProductCard product={product} />);

    await user.click(screen.getByText('Foco'));

    expect(navigateMock).toHaveBeenCalledWith('/productos/abc-123');
  });

  it('should call addItem with the product and quantity 1 when the add-to-cart button is clicked', async () => {
    const user = userEvent.setup();
    const product = buildProduct({ id: 'abc-123', name: 'Foco' });

    renderWithProviders(<ProductCard product={product} />);

    await user.click(screen.getByRole('button', { name: /agregar al carrito/i }));

    expect(addItemMock).toHaveBeenCalledTimes(1);
    expect(addItemMock).toHaveBeenCalledWith(product, 1);
    expect(addToastMock).toHaveBeenCalledTimes(1);
    expect(addToastMock).toHaveBeenCalledWith('Foco agregado al carrito');
  });

  it('should not navigate when the add-to-cart button is clicked', async () => {
    const user = userEvent.setup();
    const product = buildProduct({ id: 'abc-123' });

    renderWithProviders(<ProductCard product={product} />);

    await user.click(screen.getByRole('button', { name: /agregar al carrito/i }));

    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('should give the add-to-cart button a 44px minimum tap target via min-h-11', () => {
    const product = buildProduct();

    renderWithProviders(<ProductCard product={product} />);

    const button = screen.getByRole('button', { name: /agregar al carrito/i });
    expect(button.className).toMatch(/\bmin-h-11\b/);
  });
});
