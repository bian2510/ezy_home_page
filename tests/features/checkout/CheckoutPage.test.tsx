import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CheckoutPage from '@/features/checkout/CheckoutPage';
import { CartProvider } from '@/features/cart/CartProvider';
import type { Product, ProductPricing } from '@/types';
import { buildProduct } from '../../helpers/builders';

const STORAGE_KEY = 'ezyhome_cart';
const VALVE = buildProduct({ id: 'p-1', sku: 'SKU-AUTO-43091', name: 'Válvula TV05' });

const AVAILABLE: ProductPricing = {
  price: 115_500,
  transferPrice: 110_000,
  availability: 'available',
  stock: 5,
};
let pricing: ProductPricing = AVAILABLE;
vi.mock('@/features/pricing/usePricing', () => ({
  usePricing: () => ({ status: 'ready', pricingOf: (_product: Product) => pricing }),
}));

vi.mock('@/features/toast/useToast', () => ({
  useToast: () => ({ addToast: vi.fn(), removeToast: vi.fn(), toasts: [] }),
}));

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const erpOrder = {
  token: 'tok-123',
  number: 7,
  status: 'pending_payment',
  payment_method: 'transfer',
  total: 220_000,
  expires_at: '2026-10-31T12:00:00Z',
  checkout_url: null,
  items: [],
  transfer: { alias: 'ezyhome.tienda', cbu: null, holder: 'EzyHome SRL', bank: null },
  pickup: { address: 'Av. Siempreviva 742', hours: 'Lun a vie 10 a 18' },
};

interface SentBody {
  idempotency_key: string;
  [key: string]: unknown;
}

const sentBody = (call: unknown): SentBody =>
  JSON.parse((call as [string, RequestInit])[1].body as string) as SentBody;

const renderCheckout = () =>
  render(
    <MemoryRouter initialEntries={['/checkout']}>
      <CartProvider>
        <Routes>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/pedido/:token" element={<p>Página del pedido</p>} />
        </Routes>
      </CartProvider>
    </MemoryRouter>,
  );

const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/nombre y apellido/i), 'Ana Pérez');
  await user.type(screen.getByLabelText(/whatsapp/i), '11 5555-4444');
  await user.type(screen.getByLabelText(/^email/i), 'ana@mail.com');
  await user.type(screen.getByLabelText(/^dni$/i), '30111222');
  await user.click(screen.getByRole('checkbox', { name: /acepto/i }));
};

describe('CheckoutPage', () => {
  beforeEach(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([{ product: VALVE, quantity: 2 }]));
    vi.stubEnv('VITE_STORE_API_KEY', 'clave');
    vi.stubEnv('VITE_STORE_API_URL', 'https://erp.test');
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    pricing = AVAILABLE;
  });

  it('should show the order summary with the transfer total and pickup', () => {
    renderCheckout();

    expect(screen.getByText(/2 × válvula tv05/i)).toBeInTheDocument();
    expect(screen.getByTestId('checkout-total')).toHaveTextContent(/220\.000/);
    expect(screen.getByText(/retiro en el local/i)).toBeInTheDocument();
    expect(screen.getByText(/transferencia/i, { selector: 'p, li, span, strong' })).toBeTruthy();
    expect(screen.getByText(/ley 25\.326/i)).toBeInTheDocument();
  });

  it('should ask for the DNI as a required field and say what it is for', () => {
    renderCheckout();

    expect(screen.getByLabelText(/^dni$/i)).toBeInTheDocument();
    expect(screen.queryByText(/opcional/i)).not.toBeInTheDocument();
    expect(screen.getByText(/factura/i)).toBeInTheDocument();
    expect(screen.getByText(/quién retira/i)).toBeInTheDocument();
  });

  it('should create the order, empty the cart and go to the order page', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ order: erpOrder }, 201));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderCheckout();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));

    expect(await screen.findByText('Página del pedido')).toBeInTheDocument();
    const body = sentBody(fetchMock.mock.calls[0]);
    expect(body).toMatchObject({
      payment_method: 'transfer',
      buyer: {
        name: 'Ana Pérez',
        phone: '11 5555-4444',
        email: 'ana@mail.com',
        document: '30111222',
      },
      items: [{ sku: 'SKU-AUTO-43091', quantity: 2 }],
    });
    expect(body.idempotency_key).toMatch(/^[A-Za-z0-9_-]{8,100}$/);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([]);
  });

  it('should not call the ERP while the form has errors', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderCheckout();

    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText(/poné tu nombre/i)).toBeInTheDocument();
    expect(screen.getByText(/aceptar el aviso de privacidad/i)).toBeInTheDocument();
  });

  it('should reuse the same attempt key when the visitor retries after a network failure', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(jsonResponse({ order: erpOrder }, 201));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderCheckout();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/conexión/i);
    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));

    await screen.findByText('Página del pedido');
    const keys = fetchMock.mock.calls.map((call) => sentBody(call).idempotency_key);
    expect(keys[0]).toBe(keys[1]);
  });

  it('should use a new attempt key when the visitor changes the data', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ errors: { buyer_email: ['no es un email válido'] } }, 422),
      )
      .mockResolvedValueOnce(jsonResponse({ order: erpOrder }, 201));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderCheckout();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));
    expect(await screen.findByText('no es un email válido')).toBeInTheDocument();
    await user.type(screen.getByLabelText(/^email/i), 'x');
    expect(screen.queryByText('no es un email válido')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));

    await screen.findByText('Página del pedido');
    const keys = fetchMock.mock.calls.map((call) => sentBody(call).idempotency_key);
    expect(keys[0]).not.toBe(keys[1]);
  });

  it('should explain the missing stock and adjust the cart on request (409)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(
          {
            errors: {
              detail: 'No hay stock suficiente',
              items: [{ sku: 'SKU-AUTO-43091', available: 1 }],
            },
          },
          409,
        ),
      ),
    );
    const user = userEvent.setup();
    renderCheckout();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));

    expect(await screen.findByText(/válvula tv05: hay 1 disponible/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /ajustar el carrito/i }));

    expect(screen.getByText(/1 × válvula tv05/i)).toBeInTheDocument();
  });

  it('should show the ERP message when the buyer has too many pending orders (429)', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(
            { errors: { detail: 'Ya tenés pedidos pendientes; escribinos por WhatsApp' } },
            429,
          ),
        ),
    );
    const user = userEvent.setup();
    renderCheckout();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/ya tenés pedidos pendientes/i);
  });

  it('should block the checkout and send to WhatsApp when a product has no stock', () => {
    pricing = { ...AVAILABLE, availability: 'out_of_stock', stock: 0 };
    renderCheckout();

    expect(screen.getByText(/consultanos por whatsapp/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /confirmar pedido/i })).not.toBeInTheDocument();
  });

  it('should disable the button while the order is being sent', async () => {
    let resolve: (value: Response) => void = () => undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockReturnValue(
        new Promise<Response>((done) => {
          resolve = done;
        }),
      ),
    );
    const user = userEvent.setup();
    renderCheckout();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));

    expect(screen.getByRole('button', { name: /enviando/i })).toBeDisabled();
    resolve(jsonResponse({ order: erpOrder }, 201));
    await waitFor(() => expect(screen.getByText('Página del pedido')).toBeInTheDocument());
  });
});
