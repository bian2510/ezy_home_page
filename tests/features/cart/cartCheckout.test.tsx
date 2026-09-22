import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '@/features/cart/CartProvider';
import CartPage from '@/features/cart/CartPage';
import { buildProduct } from '../../helpers/builders';

const STORAGE_KEY = 'ezyhome_cart';

vi.mock('@/features/toast/useToast', () => ({
  useToast: () => ({ toasts: [], addToast: vi.fn(), removeToast: vi.fn() }),
}));

// El número sale del accessor de entorno — nunca de `process.env`, que no
// existe en el browser bajo Vite.
vi.mock('@/lib/env', () => ({
  getWhatsAppNumber: () => '5491122334455',
}));

const renderCart = () =>
  render(
    <MemoryRouter initialEntries={['/carrito']}>
      <CartProvider>
        <CartPage />
      </CartProvider>
    </MemoryRouter>,
  );

describe('Checkout por WhatsApp', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ product: buildProduct(), quantity: 2 }]),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('should open a wa.me link addressed to the configured phone number', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = userEvent.setup();
    renderCart();

    await user.click(screen.getByRole('button', { name: /comprar por whatsapp/i }));

    expect(openSpy).toHaveBeenCalledTimes(1);
    const url = openSpy.mock.calls[0]?.[0] as string;
    expect(url.startsWith('https://wa.me/5491122334455?text=')).toBe(true);
  });

  it('should include the cart contents in the pre-composed message', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = userEvent.setup();
    renderCart();

    await user.click(screen.getByRole('button', { name: /comprar por whatsapp/i }));

    const url = openSpy.mock.calls[0]?.[0] as string;
    const message = decodeURIComponent(url.split('?text=')[1] ?? '');
    expect(message).toContain('Foco Inteligente');
    expect(message).toContain('2x');
  });
});
