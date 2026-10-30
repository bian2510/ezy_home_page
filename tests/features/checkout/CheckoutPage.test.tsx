import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
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

function OrderPageStub() {
  const location = useLocation();
  return (
    <p>
      Página del pedido <span data-testid="order-state">{JSON.stringify(location.state)}</span>
    </p>
  );
}

const renderCheckout = () =>
  render(
    <MemoryRouter initialEntries={['/checkout']}>
      <CartProvider>
        <Routes>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/pedido/:token" element={<OrderPageStub />} />
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

  it('should ask for the WhatsApp as 10 numbers and drop spaces and dashes as they type', async () => {
    const user = userEvent.setup();
    renderCheckout();
    const phone = screen.getByLabelText(/whatsapp/i);

    await user.type(phone, '11 5555-4444');

    expect(phone).toHaveValue('1155554444');
    expect(phone).toHaveAttribute('inputmode', 'numeric');
    expect(phone).toHaveAccessibleDescription(
      'Ingresá tu número con código de área, sin 0 ni 15 (10 números)',
    );
  });

  it('should not call the ERP with a WhatsApp that has the 15', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderCheckout();

    await fillForm(user);
    await user.clear(screen.getByLabelText(/whatsapp/i));
    await user.type(screen.getByLabelText(/whatsapp/i), '11 15 5555-4444');
    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/whatsapp/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('should say the tab keeps the order data only to switch to transfer', () => {
    vi.stubEnv('VITE_MERCADOPAGO_ENABLED', 'true');
    renderCheckout();

    const notice = screen.getByText(/ley 25\.326/i);
    expect(notice).toHaveTextContent(/esta pestaña/i);
    expect(notice).toHaveTextContent(/nombre, whatsapp, email, dni y los productos/i);
    expect(notice).toHaveTextContent(/mercado pago a transferencia/i);
    expect(notice).toHaveTextContent(/cerrás la pestaña o se cierra el pedido/i);
    expect(notice).toHaveTextContent(/no los mandamos a ningún otro lado/i);
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

    expect(await screen.findByText(/página del pedido/i)).toBeInTheDocument();
    const body = sentBody(fetchMock.mock.calls[0]);
    expect(body).toMatchObject({
      payment_method: 'transfer',
      buyer: {
        name: 'Ana Pérez',
        phone: '1155554444',
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

    await screen.findByText(/página del pedido/i);
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

    await screen.findByText(/página del pedido/i);
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
    await waitFor(() => expect(screen.getByText(/página del pedido/i)).toBeInTheDocument());
  });

  it('should not offer Mercado Pago while VITE_MERCADOPAGO_ENABLED is off', () => {
    renderCheckout();

    expect(screen.queryByRole('radio', { name: /mercado pago/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/mercado pago/i)).not.toBeInTheDocument();
  });

  describe('with Mercado Pago enabled', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_MERCADOPAGO_ENABLED', 'true');
    });

    it('should offer both methods with their totals and start with transfer', () => {
      renderCheckout();

      const transfer = screen.getByRole('radio', { name: /transferencia/i });
      const mercadoPago = screen.getByRole('radio', { name: /mercado pago/i });
      expect(transfer).toBeChecked();
      expect(mercadoPago).not.toBeChecked();
      expect(transfer.closest('label')).toHaveTextContent(/220\.000/);
      expect(mercadoPago.closest('label')).toHaveTextContent(/231\.000/);
      expect(screen.getByTestId('checkout-total')).toHaveTextContent(/220\.000/);
    });

    it('should show the Mercado Pago total when the buyer picks it', async () => {
      const user = userEvent.setup();
      renderCheckout();

      await user.click(screen.getByRole('radio', { name: /mercado pago/i }));

      expect(screen.getByTestId('checkout-total')).toHaveTextContent(/231\.000/);
      expect(screen.getByRole('button', { name: /pagar con mercado pago/i })).toBeInTheDocument();
    });

    it('should create a Mercado Pago order and open its page to go pay', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ order: { ...erpOrder, payment_method: 'mercado_pago' } }, 201),
        );
      vi.stubGlobal('fetch', fetchMock);
      const user = userEvent.setup();
      renderCheckout();

      await fillForm(user);
      await user.click(screen.getByRole('radio', { name: /mercado pago/i }));
      await user.click(screen.getByRole('button', { name: /pagar con mercado pago/i }));

      expect(await screen.findByText(/página del pedido/i)).toBeInTheDocument();
      expect(sentBody(fetchMock.mock.calls[0])).toMatchObject({ payment_method: 'mercado_pago' });
      expect(screen.getByTestId('order-state')).toHaveTextContent('"openMercadoPago":true');
      expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([]);
    });

    it('should use a new attempt key when the buyer changes the payment method', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(
          jsonResponse({ errors: { detail: 'Mercado Pago no está disponible' } }, 422),
        )
        .mockResolvedValueOnce(jsonResponse({ order: erpOrder }, 201));
      vi.stubGlobal('fetch', fetchMock);
      const user = userEvent.setup();
      renderCheckout();

      await fillForm(user);
      await user.click(screen.getByRole('radio', { name: /mercado pago/i }));
      await user.click(screen.getByRole('button', { name: /pagar con mercado pago/i }));
      expect(await screen.findByRole('alert')).toHaveTextContent(
        /mercado pago no está disponible/i,
      );
      await user.click(screen.getByRole('radio', { name: /transferencia/i }));
      await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));

      await screen.findByText(/página del pedido/i);
      const [first, second] = fetchMock.mock.calls.map((call) => sentBody(call));
      expect(second).toMatchObject({ payment_method: 'transfer' });
      expect(first?.idempotency_key).not.toBe(second?.idempotency_key);
      expect(screen.getByTestId('order-state')).toHaveTextContent('null');
    });
  });
});
