import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type * as RRD from 'react-router-dom';
import type { ReactElement } from 'react';
import type { Product } from '@/types';
import { formatPrice } from '@/types';
import ProductCard from '@/features/catalog/ProductCard';
import { CartProvider } from '@/features/cart/CartProvider';

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

const buildProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'p-1',
  name: 'Foco Inteligente RGBW',
  description: 'Foco LED Wi-Fi 9W',
  price: 12500,
  images: ['/images/foco.jpg'],
  category: 'iluminacion',
  isBestseller: false,
  isOnSale: false,
  ...overrides,
});

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
    window.localStorage.clear();
  });

  it('should render the product name and ARS-formatted price', () => {
    const product = buildProduct({ name: 'Foco Inteligente RGBW', price: 12500 });

    renderWithProviders(<ProductCard product={product} />);

    expect(screen.getByText('Foco Inteligente RGBW')).toBeInTheDocument();
    expect(screen.getByText(matchesPrice(12500))).toBeInTheDocument();
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

  it('should show the "Oferta" badge and a struck-through original price when isOnSale is true', () => {
    const product = buildProduct({
      price: 9000,
      isOnSale: true,
      originalPrice: 12000,
    });

    renderWithProviders(<ProductCard product={product} />);

    expect(screen.getByText(/oferta/i)).toBeInTheDocument();
    const original = screen.getByText(matchesPrice(12000));
    expect(original).toBeInTheDocument();
    expect(original.tagName.toLowerCase()).toBe('s');
  });

  it('should not show the "Oferta" badge when isOnSale is false', () => {
    const product = buildProduct({ isOnSale: false });

    renderWithProviders(<ProductCard product={product} />);

    expect(screen.queryByText(/oferta/i)).not.toBeInTheDocument();
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

    await user.click(
      screen.getByRole('button', { name: /agregar al carrito/i }),
    );

    expect(addItemMock).toHaveBeenCalledTimes(1);
    expect(addItemMock).toHaveBeenCalledWith(product, 1);
  });

  it('should not navigate when the add-to-cart button is clicked', async () => {
    const user = userEvent.setup();
    const product = buildProduct({ id: 'abc-123' });

    renderWithProviders(<ProductCard product={product} />);

    await user.click(
      screen.getByRole('button', { name: /agregar al carrito/i }),
    );

    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('should give the add-to-cart button a 44px minimum tap target via min-h-11', () => {
    const product = buildProduct();

    renderWithProviders(<ProductCard product={product} />);

    const button = screen.getByRole('button', { name: /agregar al carrito/i });
    expect(button.className).toMatch(/\bmin-h-11\b/);
  });
});
