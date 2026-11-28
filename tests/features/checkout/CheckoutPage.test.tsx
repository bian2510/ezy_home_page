import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
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
    // En la tarjeta "Entrega" y en el resumen.
    expect(screen.getAllByText(/retiro en caballito, caba/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('radio', { name: /transferencia/i })).toBeChecked();
    expect(screen.getByText(/ley 25\.326/i)).toBeInTheDocument();
  });

  describe('rediseño', () => {
    it('should show the purchase steps with "Datos y pago" as the current one', () => {
      renderCheckout();

      const steps = within(screen.getByRole('list', { name: /pasos de la compra/i })).getAllByRole(
        'listitem',
      );
      expect(steps[1]).toHaveAttribute('aria-current', 'step');
      expect(steps[1]).toHaveTextContent('2. Datos y pago');
      expect(steps[0]).toHaveTextContent(/completado/i);
    });

    it('should split the form into numbered cards and say pickup is free', () => {
      renderCheckout();

      expect(screen.getByRole('heading', { name: /información de contacto/i })).toBeInTheDocument();
      const delivery = screen.getByRole('heading', { name: /^entrega$/i }).closest('section')!;
      expect(within(delivery).getByText(/retiro en caballito, caba/i)).toBeInTheDocument();
      expect(within(delivery).getByText(/sin cargo/i)).toBeInTheDocument();
      // El barrio se ve antes de elegir; la dirección exacta y el horario los manda el ERP con el pedido.
      expect(within(delivery).getByText(/punto pick-up de caballito/i)).toBeInTheDocument();
      expect(within(delivery).getByText(/dirección exacta y el horario/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /medio de pago/i })).toBeInTheDocument();
    });

    it('should label the phone as "Teléfono (WhatsApp)"', () => {
      renderCheckout();

      expect(screen.getByLabelText('Teléfono (WhatsApp)')).toHaveAttribute('type', 'tel');
    });

    it('should list each product with its quantity and line price in the summary', () => {
      renderCheckout();

      const summary = screen
        .getByRole('heading', { name: /resumen de tu pedido/i })
        .closest('aside')!;
      expect(within(summary).getByText(/2 × válvula tv05/i)).toBeInTheDocument();
      expect(within(summary).getByText(/retiro en caballito, caba/i)).toBeInTheDocument();
      expect(within(summary).getByText(/sin cargo/i)).toBeInTheDocument();
      expect(within(summary).getByTestId('checkout-total')).toHaveTextContent(/220\.000/);
    });

    it('should not offer a coupon nor promise encrypted transactions', () => {
      renderCheckout();

      expect(screen.queryByText(/cupón/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/cifrad/i)).not.toBeInTheDocument();
    });

    it('should offer help by WhatsApp only when there is a number', () => {
      vi.stubEnv('VITE_WHATSAPP_NUMBER', '5491122334455');
      const { unmount } = renderCheckout();
      expect(screen.getByRole('link', { name: /chateá por whatsapp/i })).toHaveAttribute(
        'href',
        'https://wa.me/5491122334455',
      );
      unmount();

      vi.stubEnv('VITE_WHATSAPP_NUMBER', '');
      renderCheckout();
      expect(screen.queryByRole('link', { name: /chateá por whatsapp/i })).not.toBeInTheDocument();
    });

    it('should describe the transfer truthfully, without "Efectivo"', () => {
      renderCheckout();

      expect(screen.getByText(/al confirmar ves los datos de la cuenta/i)).toBeInTheDocument();
      expect(screen.queryByText(/efectivo/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/aprobación instantánea/i)).not.toBeInTheDocument();
    });
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
    renderCheckout();

    const notice = screen.getByText(/ley 25\.326/i);
    expect(notice).toHaveTextContent(/esta pestaña/i);
    expect(notice).toHaveTextContent(
      /nombre, whatsapp, email, dni, los productos del pedido y, con envío a domicilio, tu dirección/i,
    );
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

  describe('Meta Pixel', () => {
    it('should tell Meta the checkout started, once, with the cart value', () => {
      const fbq = vi.fn();
      vi.stubGlobal('fbq', fbq);

      renderCheckout();

      const starts = fbq.mock.calls.filter((call) => call[1] === 'InitiateCheckout');
      expect(starts).toHaveLength(1);
      expect(starts[0]?.[2]).toMatchObject({
        content_ids: ['SKU-AUTO-43091'],
        num_items: 2,
        value: 220_000,
        currency: 'ARS',
      });
    });

    it('should not tell Meta the checkout started while it is blocked', () => {
      const fbq = vi.fn();
      vi.stubGlobal('fbq', fbq);
      pricing = { ...AVAILABLE, availability: 'out_of_stock', stock: 0 };

      renderCheckout();

      expect(fbq).not.toHaveBeenCalledWith('track', 'InitiateCheckout', expect.anything());
    });

    it('should report the purchase with the ERP total and the order number as event id', async () => {
      const fbq = vi.fn();
      vi.stubGlobal('fbq', fbq);
      const order = {
        ...erpOrder,
        items: [
          {
            sku: 'SKU-AUTO-43091',
            name: 'Válvula TV05',
            quantity: 2,
            unit_price: 110_000,
            line_total: 220_000,
          },
        ],
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ order }, 201)));
      const user = userEvent.setup();
      renderCheckout();

      await fillForm(user);
      await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));
      await screen.findByText(/página del pedido/i);

      expect(fbq).toHaveBeenCalledWith(
        'track',
        'Purchase',
        expect.objectContaining({
          content_ids: ['SKU-AUTO-43091'],
          num_items: 2,
          value: 220_000,
          currency: 'ARS',
        }),
        { eventID: 'pedido-7' },
      );
    });

    it('should not report a purchase when the ERP rejects the order', async () => {
      const fbq = vi.fn();
      vi.stubGlobal('fbq', fbq);
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('sin red')));
      const user = userEvent.setup();
      renderCheckout();

      await fillForm(user);
      await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));
      await screen.findByRole('alert');

      expect(fbq).not.toHaveBeenCalledWith(
        'track',
        'Purchase',
        expect.anything(),
        expect.anything(),
      );
    });
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

  describe('Mercado Pago', () => {
    it('should badge the transfer with the real discount of the totals', () => {
      renderCheckout();

      // 231.000 con MP contra 220.000 por transferencia: 4,76 % → -5%.
      expect(
        screen.getByRole('radio', { name: /transferencia/i }).closest('label'),
      ).toHaveTextContent('-5%');
      expect(
        screen.getByRole('radio', { name: /mercado pago/i }).closest('label'),
      ).toHaveTextContent(/tarjetas, dinero en cuenta y más/i);
    });

    it('should not badge the transfer when it costs the same', () => {
      pricing = { price: 110_000, transferPrice: null, availability: 'available', stock: 5 };
      renderCheckout();

      expect(
        screen.getByRole('radio', { name: /transferencia/i }).closest('label'),
      ).not.toHaveTextContent('%');
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

  describe('envío a domicilio', () => {
    const QUOTE_OPTION = {
      token: 'cotizacion-de-prueba',
      carrier: 'own_rate',
      service: 'home',
      name: 'Envío a domicilio',
      price: 8_500,
      delivery_time: '3 a 5 días hábiles',
      expires_at: '2026-11-17T22:00:00Z',
    };

    const isQuote = (url: unknown) => String(url).endsWith('/api/store/shipping/quotes');

    /** `fetch` del ERP: la cotización responde `quote`, el pedido responde `order`. */
    const erpFetch = (
      quote: () => Response = () => jsonResponse({ options: [QUOTE_OPTION] }),
      order: () => Response = () => jsonResponse({ order: erpOrder }, 201),
    ) =>
      vi
        .fn()
        .mockImplementation((url: string) => Promise.resolve(isQuote(url) ? quote() : order()));

    const callsTo = (fetchMock: ReturnType<typeof vi.fn>, quotes: boolean) =>
      fetchMock.mock.calls.filter(([url]) => isQuote(url) === quotes);

    const chooseHomeDelivery = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(screen.getByRole('radio', { name: /envío a domicilio/i }));
    };

    const fillQuoteInput = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.selectOptions(screen.getByLabelText('Provincia'), 'B');
      await user.type(screen.getByLabelText('Código postal'), '1704');
    };

    const fillAddress = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(screen.getByLabelText('Calle'), 'Av. Rivadavia');
      await user.type(screen.getByLabelText('Altura'), '1234');
      await user.type(screen.getByLabelText('Localidad'), 'Ramos Mejía');
    };

    it('should start with pickup and not quote anything', () => {
      const fetchMock = erpFetch();
      vi.stubGlobal('fetch', fetchMock);
      renderCheckout();

      expect(screen.getByRole('radio', { name: /retiro en caballito, caba/i })).toBeChecked();
      expect(screen.queryByLabelText('Calle')).not.toBeInTheDocument();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should ask for the province and the postal code before quoting, with the button off', async () => {
      const fetchMock = erpFetch();
      vi.stubGlobal('fetch', fetchMock);
      const user = userEvent.setup();
      renderCheckout();

      await chooseHomeDelivery(user);

      expect(screen.getByTestId('shipping-quote')).toHaveTextContent(
        /elegí tu provincia y poné tu código postal/i,
      );
      expect(screen.getByRole('button', { name: /confirmar pedido/i })).toBeDisabled();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should quote with the province, the postal code and the cart, and add the price to the total', async () => {
      const fetchMock = erpFetch();
      vi.stubGlobal('fetch', fetchMock);
      const user = userEvent.setup();
      renderCheckout();

      await chooseHomeDelivery(user);
      await fillQuoteInput(user);

      const quote = screen.getByTestId('shipping-quote');
      await waitFor(() => expect(quote).toHaveTextContent(/8\.500/));
      expect(quote).toHaveTextContent('3 a 5 días hábiles');
      const [quoteCall] = callsTo(fetchMock, true);
      expect(sentBody(quoteCall)).toEqual({
        province: 'B',
        postal_code: '1704',
        items: [{ sku: 'SKU-AUTO-43091', quantity: 2 }],
      });
      const summary = screen
        .getByRole('heading', { name: /resumen de tu pedido/i })
        .closest('aside')!;
      expect(quote).toHaveTextContent('Envío por Andreani');
      expect(within(summary).getByText('Envío por Andreani')).toBeInTheDocument();
      expect(screen.getByTestId('checkout-total')).toHaveTextContent(/228\.500/);
      expect(screen.getByRole('button', { name: /confirmar pedido/i })).toBeEnabled();
    });

    it('should say that CABA goes with our own courier', async () => {
      vi.stubGlobal('fetch', erpFetch());
      const user = userEvent.setup();
      renderCheckout();

      await chooseHomeDelivery(user);
      await user.selectOptions(screen.getByLabelText('Provincia'), 'C');
      await user.type(screen.getByLabelText('Código postal'), '1405');

      const quote = screen.getByTestId('shipping-quote');
      await waitFor(() => expect(quote).toHaveTextContent('Mensajería propia (CABA)'));
      const summary = screen
        .getByRole('heading', { name: /resumen de tu pedido/i })
        .closest('aside')!;
      expect(within(summary).getByText('Mensajería propia (CABA)')).toBeInTheDocument();
    });

    it('should tell who carries the order before choosing a province', () => {
      vi.stubGlobal('fetch', erpFetch());
      renderCheckout();

      expect(
        screen.getByRole('radio', { name: /envío a domicilio/i }).closest('label'),
      ).toHaveTextContent(/en caba, con mensajería propia a costo fijo.*por andreani/i);
    });

    it('should create the order with the quote token and the address', async () => {
      const fetchMock = erpFetch();
      vi.stubGlobal('fetch', fetchMock);
      const user = userEvent.setup();
      renderCheckout();

      await fillForm(user);
      await chooseHomeDelivery(user);
      await fillQuoteInput(user);
      await fillAddress(user);
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /confirmar pedido/i })).toBeEnabled(),
      );
      await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));

      expect(await screen.findByText(/página del pedido/i)).toBeInTheDocument();
      const [orderCall] = callsTo(fetchMock, false);
      expect(sentBody(orderCall)).toMatchObject({
        delivery: 'carrier',
        shipping_quote_token: QUOTE_OPTION.token,
        shipping: {
          street: 'Av. Rivadavia',
          street_number: '1234',
          floor_apartment: null,
          city: 'Ramos Mejía',
          province: 'B',
          postal_code: '1704',
        },
      });
    });

    it('should ask for the missing address fields and not create the order', async () => {
      const fetchMock = erpFetch();
      vi.stubGlobal('fetch', fetchMock);
      const user = userEvent.setup();
      renderCheckout();

      await fillForm(user);
      await chooseHomeDelivery(user);
      await fillQuoteInput(user);
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /confirmar pedido/i })).toBeEnabled(),
      );
      await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));

      expect(screen.getByText('Poné la calle')).toBeInTheDocument();
      expect(screen.getByLabelText('Altura')).toHaveAttribute('aria-invalid', 'true');
      expect(callsTo(fetchMock, false)).toHaveLength(0);
    });

    it.each([
      ['no option', () => jsonResponse({ options: [] })],
      ['a 404 while the ERP has no shipping yet', () => jsonResponse({}, 404)],
    ])('should offer WhatsApp and keep the button off with %s', async (_case, quote) => {
      vi.stubEnv('VITE_WHATSAPP_NUMBER', '5491122334455');
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      vi.stubGlobal('fetch', erpFetch(quote));
      const user = userEvent.setup();
      renderCheckout();

      await chooseHomeDelivery(user);
      await fillQuoteInput(user);

      const status = screen.getByTestId('shipping-quote');
      await waitFor(() =>
        expect(status).toHaveTextContent(/todavía no podemos calcular el envío desde la web/i),
      );
      expect(status).not.toHaveTextContent(/a tu zona/i);
      const link = within(status).getByRole('link', { name: /escribinos por whatsapp/i });
      const href = link.getAttribute('href') ?? '';
      expect(href.startsWith('https://wa.me/5491122334455?text=')).toBe(true);
      // El pedido y la dirección ya escritos: no hay que repetir nada en el chat.
      const message = decodeURIComponent(href.split('?text=')[1] ?? '');
      expect(message).toContain('2x Válvula TV05');
      expect(message).toContain('Buenos Aires (CP 1704)');
      expect(message).toContain('¿Me cotizan el envío?');
      expect(screen.getByRole('button', { name: /confirmar pedido/i })).toBeDisabled();
      expect(screen.getByTestId('checkout-total')).toHaveTextContent(/220\.000/);
    });

    // Un CP de otra provincia no cotiza: se avisa para que lo corrija, con
    // WhatsApp por si está bien (usuario, 2026-11-18).
    it('should say the postal code is not from the province and keep the button off', async () => {
      vi.stubEnv('VITE_WHATSAPP_NUMBER', '5491122334455');
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      vi.stubGlobal(
        'fetch',
        erpFetch(() => jsonResponse({ errors: { postal_code: ['no es de esa provincia'] } }, 422)),
      );
      const user = userEvent.setup();
      renderCheckout();

      await chooseHomeDelivery(user);
      await fillQuoteInput(user);

      const status = screen.getByTestId('shipping-quote');
      await waitFor(() =>
        expect(status).toHaveTextContent(/ese código postal no es de esa provincia/i),
      );
      expect(status).not.toHaveTextContent(/todavía no podemos calcular/i);
      expect(
        within(status).getByRole('link', { name: /escribinos por whatsapp/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirmar pedido/i })).toBeDisabled();
    });

    it('should show the ERP message and quote again when the quote expired', async () => {
      let orders = 0;
      const fetchMock = erpFetch(undefined, () => {
        orders += 1;
        return jsonResponse(
          { errors: { detail: 'La cotización del envío venció, cotizá de nuevo' } },
          422,
        );
      });
      vi.stubGlobal('fetch', fetchMock);
      const user = userEvent.setup();
      renderCheckout();

      await fillForm(user);
      await chooseHomeDelivery(user);
      await fillQuoteInput(user);
      await fillAddress(user);
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /confirmar pedido/i })).toBeEnabled(),
      );
      await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));

      expect(await screen.findByRole('alert')).toHaveTextContent(/cotizá de nuevo/i);
      expect(orders).toBe(1);
      await waitFor(() => expect(callsTo(fetchMock, true)).toHaveLength(2));
    });

    it('should keep the transfer discount of the products when the shipping is added', async () => {
      vi.stubGlobal(
        'fetch',
        erpFetch(() => jsonResponse({ options: [{ ...QUOTE_OPTION, price: 30_000 }] })),
      );
      const user = userEvent.setup();
      renderCheckout();

      await chooseHomeDelivery(user);
      await fillQuoteInput(user);
      await waitFor(() =>
        expect(screen.getByTestId('checkout-total')).toHaveTextContent(/250\.000/),
      );

      // El envío no tiene descuento: el cartel es el de los productos
      // (231.000 contra 220.000, -5%), no el del total con envío (261.000
      // contra 250.000, -4%).
      const transfer = screen.getByRole('radio', { name: /transferencia/i }).closest('label')!;
      expect(transfer).toHaveTextContent('-5%');
      expect(transfer).toHaveTextContent(/250\.000/);
    });

    it('should go back to free pickup when the buyer changes their mind', async () => {
      vi.stubGlobal('fetch', erpFetch());
      const user = userEvent.setup();
      renderCheckout();

      await chooseHomeDelivery(user);
      await fillQuoteInput(user);
      await waitFor(() =>
        expect(screen.getByTestId('checkout-total')).toHaveTextContent(/228\.500/),
      );
      await user.click(screen.getByRole('radio', { name: /retiro en caballito, caba/i }));

      expect(screen.getByTestId('checkout-total')).toHaveTextContent(/220\.000/);
      expect(screen.queryByLabelText('Calle')).not.toBeInTheDocument();
    });

    it('should say the address is used only to send the order', () => {
      renderCheckout();

      expect(screen.getByText(/ley 25\.326/i)).toHaveTextContent(
        /tu dirección, si pedís envío a domicilio/i,
      );
    });
  });
});
