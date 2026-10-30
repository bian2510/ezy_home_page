// Compra con Mercado Pago de punta a punta en el sitio (ERP mockeado): el
// checkout crea el pedido de MP, la página del pedido espera el link y, si MP
// no lo pudo crear, el comprador cambia a transferencia con un pedido nuevo.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CheckoutPage from '@/features/checkout/CheckoutPage';
import OrderPage from '@/features/checkout/OrderPage';
import { CartProvider } from '@/features/cart/CartProvider';
import type { Product, ProductPricing } from '@/types';
import { goToExternalUrl } from '@/lib/redirect';
import { buildProduct } from '../helpers/builders';

vi.mock('@/lib/redirect', () => ({ goToExternalUrl: vi.fn() }));

const PRICING: ProductPricing = {
  price: 115_500,
  transferPrice: 110_000,
  availability: 'available',
  stock: 5,
};
vi.mock('@/features/pricing/usePricing', () => ({
  usePricing: () => ({ status: 'ready', pricingOf: (_product: Product) => PRICING }),
}));

vi.mock('@/features/toast/useToast', () => ({
  useToast: () => ({ addToast: vi.fn(), removeToast: vi.fn(), toasts: [] }),
}));

const VALVE = buildProduct({ id: 'p-1', sku: 'SKU-AUTO-43091', name: 'Válvula TV05' });

const order = (overrides: Record<string, unknown>) => ({
  number: 8,
  status: 'pending_payment',
  expires_at: '2099-10-30T12:30:00Z',
  checkout_url: null,
  checkout_error: false,
  items: [
    { sku: 'SKU-AUTO-43091', name: 'Válvula TV05', quantity: 2, unit_price: 1, line_total: 2 },
  ],
  transfer: { alias: 'ezyhome.tienda', cbu: null, holder: 'EzyHome SRL', bank: null },
  pickup: { address: 'Av. Siempreviva 742', hours: 'Lun a vie 10 a 18' },
  ...overrides,
});

const MP_ORDER = order({
  token: 'tok-mp',
  payment_method: 'mercado_pago',
  total: 231_000,
  checkout_error: true,
});
const TRANSFER_ORDER = order({
  token: 'tok-tr',
  number: 9,
  payment_method: 'transfer',
  total: 220_000,
});

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

type Call = [string, RequestInit | undefined];
const posts = (fetchMock: ReturnType<typeof vi.fn>) =>
  (fetchMock.mock.calls as Call[])
    .filter(([, init]) => init?.method === 'POST')
    .map(([, init]) => JSON.parse(init?.body as string) as Record<string, unknown>);

describe('Checkout with Mercado Pago', () => {
  beforeEach(() => {
    window.localStorage.setItem('ezyhome_cart', JSON.stringify([{ product: VALVE, quantity: 2 }]));
    vi.stubEnv('VITE_STORE_API_KEY', 'clave');
    vi.stubEnv('VITE_STORE_API_URL', 'https://erp.test');
    vi.stubEnv('VITE_MERCADOPAGO_ENABLED', 'true');
  });

  afterEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('should switch to transfer with a new order and a new attempt key when MP fails', async () => {
    let created = 0;
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        created += 1;
        return Promise.resolve(
          jsonResponse({ order: created === 1 ? MP_ORDER : TRANSFER_ORDER }, 201),
        );
      }
      return Promise.resolve(
        jsonResponse({ order: url.endsWith('/tok-tr') ? TRANSFER_ORDER : MP_ORDER }),
      );
    });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <CartProvider>
          <Routes>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/pedido/:token" element={<OrderPage />} />
          </Routes>
        </CartProvider>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/nombre y apellido/i), 'Ana Pérez');
    await user.type(screen.getByLabelText(/whatsapp/i), '1155554444');
    await user.type(screen.getByLabelText(/^email/i), 'ana@mail.com');
    await user.type(screen.getByLabelText(/^dni$/i), '30111222');
    await user.click(screen.getByRole('checkbox', { name: /acepto/i }));
    await user.click(screen.getByRole('radio', { name: /mercado pago/i }));
    await user.click(screen.getByRole('button', { name: /pagar con mercado pago/i }));

    expect(await screen.findByText(/no pudimos abrir mercado pago/i)).toBeInTheDocument();
    expect(screen.queryByText('ezyhome.tienda')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /pagar por transferencia/i }));

    expect(await screen.findByText(/transferí a esta cuenta/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /pedido n.º 9/i })).toBeInTheDocument();
    expect(screen.getByText('ezyhome.tienda')).toBeInTheDocument();
    const [mercadoPago, transfer] = posts(fetchMock);
    expect(mercadoPago).toMatchObject({ payment_method: 'mercado_pago' });
    expect(transfer).toMatchObject({
      payment_method: 'transfer',
      accepted_privacy: true,
      buyer: {
        name: 'Ana Pérez',
        phone: '1155554444',
        email: 'ana@mail.com',
        document: '30111222',
      },
      items: [{ sku: 'SKU-AUTO-43091', quantity: 2 }],
    });
    expect(transfer?.idempotency_key).not.toBe(mercadoPago?.idempotency_key);
    expect(goToExternalUrl).not.toHaveBeenCalled();
  });
});
