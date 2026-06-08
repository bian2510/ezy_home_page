import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import CartPage from '@/features/cart/CartPage';
import { CartProvider } from '@/features/cart/CartProvider';
import { useCart } from '@/features/cart/useCart';
import { formatPrice } from '@/types';
import type { Product } from '@/types';

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ addToast: vi.fn(), removeToast: vi.fn(), toasts: [] }),
}));

const buildProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'p-1',
  name: 'Foco Inteligente',
  description: 'Foco LED Wi-Fi 9W',
  price: 12500,
  images: ['/images/foco.jpg'],
  category: 'iluminacion',
  isBestseller: false,
  isOnSale: false,
  active: true,
  ...overrides,
});

const renderCartPage = () =>
  render(
    <MemoryRouter>
      <CartProvider>
        <CartPage />
      </CartProvider>
    </MemoryRouter>,
  );

describe('CartPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('should show an empty-cart message and a link to /catalogo when the cart is empty', () => {
    renderCartPage();

    expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /ver productos/i });
    expect(link).toHaveAttribute('href', '/catalogo');
  });

  it('should render the cart heading "Mi Carrito"', () => {
    renderCartPage();

    expect(screen.getByRole('heading', { name: /mi carrito/i })).toBeInTheDocument();
  });

  it('should render item names and quantities when the cart has items', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter>
        <CartProvider>{children}</CartProvider>
      </MemoryRouter>
    );
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(
        buildProduct({ id: 'p-1', name: 'Foco Inteligente', price: 12500 }),
        2,
      );
      result.current.addItem(buildProduct({ id: 'p-2', name: 'Sensor de Gas', price: 8500 }), 1);
    });

    render(
      <MemoryRouter>
        <CartProvider>
          <CartPage />
        </CartProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Foco Inteligente')).toBeInTheDocument();
    expect(screen.getByText('Sensor de Gas')).toBeInTheDocument();
    // Quantity display surfaces a "2" for the first item and "1" for the second.
    const focoRow = screen.getByText('Foco Inteligente').closest('li');
    const sensorRow = screen.getByText('Sensor de Gas').closest('li');
    expect(focoRow).not.toBeNull();
    expect(sensorRow).not.toBeNull();
    expect(within(focoRow as HTMLElement).getByText('2')).toBeInTheDocument();
    expect(within(sensorRow as HTMLElement).getByText('1')).toBeInTheDocument();
  });

  it('should display the line subtotal as quantity times unit price', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter>
        <CartProvider>{children}</CartProvider>
      </MemoryRouter>
    );
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(
        buildProduct({ id: 'p-1', name: 'Foco Inteligente', price: 12500 }),
        3,
      );
    });

    render(
      <MemoryRouter>
        <CartProvider>
          <CartPage />
        </CartProvider>
      </MemoryRouter>,
    );

    // Total surfaced on the page should reflect 12500 * 3 = 37500.
    expect(screen.getAllByText(formatPrice(12500 * 3)).length).toBeGreaterThan(0);
  });

  it('should disable the "Comprar por WhatsApp" button when the cart is empty', () => {
    renderCartPage();

    const button = screen.getByRole('button', { name: /comprar por whatsapp/i });
    expect(button).toBeDisabled();
  });

  it('should enable the "Comprar por WhatsApp" button when the cart has items', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter>
        <CartProvider>{children}</CartProvider>
      </MemoryRouter>
    );
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(buildProduct(), 1);
    });

    render(
      <MemoryRouter>
        <CartProvider>
          <CartPage />
        </CartProvider>
      </MemoryRouter>,
    );

    const button = screen.getByRole('button', { name: /comprar por whatsapp/i });
    expect(button).not.toBeDisabled();
  });

  it('should disable the decrement button when the item quantity is 1', async () => {
    const user = userEvent.setup();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter>
        <CartProvider>{children}</CartProvider>
      </MemoryRouter>
    );
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(buildProduct({ id: 'p-1', name: 'Foco Inteligente' }), 1);
    });

    render(
      <MemoryRouter>
        <CartProvider>
          <CartPage />
        </CartProvider>
      </MemoryRouter>,
    );

    const row = screen.getByText('Foco Inteligente').closest('li') as HTMLElement;
    const decrement = within(row).getByRole('button', { name: /disminuir cantidad/i });
    expect(decrement).toBeDisabled();

    // Increment then decrement should be re-enabled.
    const increment = within(row).getByRole('button', { name: /aumentar cantidad/i });
    await user.click(increment);
    expect(decrement).not.toBeDisabled();
  });
});
