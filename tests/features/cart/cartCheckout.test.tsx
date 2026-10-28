import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '@/features/cart/CartProvider';
import CartPage from '@/features/cart/CartPage';
import { buildProduct } from '../../helpers/builders';
import type * as EnvModule from '@/lib/env';
import type { Product, ProductPricing } from '@/types';
import { formatPrice } from '@/lib/formatPrice';

const STORAGE_KEY = 'ezyhome_cart';

// Precio del ERP que fija cada test; por defecto el `price` del builder.
const pricedFromBuilder = (product: Product): ProductPricing => ({
  price: product.price,
  transferPrice: null,
  availability: 'available',
});
let pricingOf = pricedFromBuilder;
vi.mock('@/features/pricing/usePricing', () => ({
  usePricing: () => ({ status: 'ready', pricingOf: (product: Product) => pricingOf(product) }),
}));

vi.mock('@/features/toast/useToast', () => ({
  useToast: () => ({ toasts: [], addToast: vi.fn(), removeToast: vi.fn() }),
}));

// El número sale del accessor de entorno — nunca de `process.env`, que no
// existe en el browser bajo Vite.
// Mock parcial: se reemplaza solo el número y el resto del módulo queda real,
// para que agregar un accessor nuevo a `lib/env` no rompa este test.
vi.mock('@/lib/env', async (importOriginal) => ({
  ...(await importOriginal<typeof EnvModule>()),
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
    pricingOf = pricedFromBuilder;
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

  it('should show the transfer total and send it in the message when it is lower', async () => {
    pricingOf = () => ({ price: 21000, transferPrice: 20000, availability: 'available' });
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = userEvent.setup();
    renderCart();

    expect(screen.getByText(/con transferencia/i)).toHaveTextContent(
      formatPrice(40000).replace(/\u00A0/g, ' '),
    );
    await user.click(screen.getByRole('button', { name: /comprar por whatsapp/i }));

    const message = decodeURIComponent(
      (openSpy.mock.calls[0]?.[0] as string).split('?text=')[1] ?? '',
    );
    expect(message).toContain(`Con transferencia: ${formatPrice(40000)}`);
  });

  it('should mark a cart line without ERP price as "Consultar precio"', () => {
    pricingOf = () => ({ price: null, transferPrice: null, availability: 'no_price' });
    renderCart();

    expect(screen.getAllByText(/consultar precio/i).length).toBeGreaterThan(0);
  });
});
