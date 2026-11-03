import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrderPage from '@/features/checkout/OrderPage';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const erpOrder = (overrides: Record<string, unknown> = {}) => ({
  token: 'tok-123',
  number: 7,
  status: 'pending_payment',
  payment_method: 'transfer',
  total: 220_000,
  expires_at: '2026-10-31T15:00:00Z',
  checkout_url: null,
  items: [
    {
      sku: 'SKU-AUTO-43091',
      name: 'Válvula TV05',
      quantity: 2,
      unit_price: 110_000,
      line_total: 220_000,
    },
  ],
  transfer: {
    alias: 'ezyhome.tienda',
    cbu: '0000003100012345678901',
    holder: 'EzyHome SRL',
    bank: 'Banco Galicia',
  },
  pickup: { address: 'Av. Siempreviva 742', hours: 'Lun a vie 10 a 18' },
  ...overrides,
});

const renderOrder = (token = 'tok-123') =>
  render(
    <MemoryRouter initialEntries={[`/pedido/${token}`]}>
      <Routes>
        <Route path="/pedido/:token" element={<OrderPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe('OrderPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_STORE_API_KEY', 'clave');
    vi.stubEnv('VITE_STORE_API_URL', 'https://erp.test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('should show where to transfer, the order number to use and where to pick up', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ order: erpOrder() }));
    vi.stubGlobal('fetch', fetchMock);
    renderOrder();

    expect(await screen.findByRole('heading', { name: /pedido n.º 7/i })).toBeInTheDocument();
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://erp.test/api/store/orders/tok-123');
    // Último paso de la compra: carrito y datos ya completados.
    const steps = screen
      .getAllByRole('listitem')
      .filter((item) => /\d\. /.test(item.textContent ?? ''));
    expect(steps.at(-1)).toHaveAttribute('aria-current', 'step');
    expect(steps.at(-1)).toHaveTextContent('3. Confirmación');
    expect(screen.getByTestId('order-total')).toHaveTextContent(/220\.000/);
    expect(screen.getByText('ezyhome.tienda')).toBeInTheDocument();
    expect(screen.getByText('0000003100012345678901')).toBeInTheDocument();
    expect(screen.getByText('EzyHome SRL')).toBeInTheDocument();
    expect(screen.getByText('Banco Galicia')).toBeInTheDocument();
    // El aviso del pago acreditado llega por email; WhatsApp no es un canal de avisos.
    expect(
      screen.getByText(/te avisamos por email cuando acreditemos el pago/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/avisamos por whatsapp/i)).not.toBeInTheDocument();
    expect(screen.getByText(/en el concepto poné "pedido 7"/i)).toBeInTheDocument();
    expect(screen.getByText(/av\. siempreviva 742/i)).toBeInTheDocument();
    expect(screen.getByText(/lun a vie 10 a 18/i)).toBeInTheDocument();
    expect(screen.getByText(/2 × válvula tv05/i)).toBeInTheDocument();
    expect(screen.getByText(/transferí antes del/i)).toBeInTheDocument();
  });

  it('should hide the bank fields the store did not load', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          order: erpOrder({
            transfer: { alias: 'ezyhome.tienda', cbu: null, holder: 'EzyHome SRL', bank: null },
          }),
        }),
      ),
    );
    renderOrder();

    await screen.findByText('ezyhome.tienda');
    expect(screen.queryByText(/cbu/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/banco/i)).not.toBeInTheDocument();
  });

  it('should say the order expired instead of asking to transfer', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ order: erpOrder({ status: 'expired' }) })),
    );
    renderOrder();

    expect(await screen.findByText(/este pedido venció/i)).toBeInTheDocument();
    expect(screen.queryByText('ezyhome.tienda')).not.toBeInTheDocument();
  });

  it('should confirm a paid order', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ order: erpOrder({ status: 'paid' }) })),
    );
    renderOrder();

    expect(
      await screen.findByRole('heading', { level: 1, name: '¡Gracias por tu compra!' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/pedido confirmado/i)).toBeInTheDocument();
    expect(
      screen.getByText('Tu pedido #7 está confirmado. Te mandamos el detalle por email.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Pago aprobado')).toBeInTheDocument();
    expect(screen.queryByText('ezyhome.tienda')).not.toBeInTheDocument();
  });

  describe('rediseño', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('should receive a pending transfer order without calling it completed', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ order: erpOrder() })));
      renderOrder();

      expect(
        await screen.findByRole('heading', { level: 1, name: '¡Recibimos tu pedido!' }),
      ).toBeInTheDocument();
      expect(screen.getByText(/pedido recibido/i)).toBeInTheDocument();
      // (La franja de pasos dice "completado" de los pasos 1 y 2: eso no cuenta.)
      expect(
        screen.queryAllByText(
          /gracias por tu compra|orden completada|pedido confirmado|pago aprobado/i,
        ),
      ).toHaveLength(0);
      expect(screen.getByText('Transferencia bancaria')).toBeInTheDocument();
      expect(screen.getByText('Esperando la transferencia')).toBeInTheDocument();
    });

    it('should hide the pickup lines the ERP did not send, without inventing them', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          jsonResponse({
            order: erpOrder({ pickup: { address: null, hours: 'Lun a vie 10 a 18' } }),
          }),
        ),
      );
      renderOrder();

      const pickup = (await screen.findByRole('heading', { name: 'Retiro en el local' })).closest(
        'section',
      )!;
      expect(within(pickup).getByText('Lun a vie 10 a 18')).toBeInTheDocument();
      expect(within(pickup).queryByText(/siempreviva/i)).toBeNull();
    });

    it('should list each product with its line total and the order total', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ order: erpOrder() })));
      renderOrder();

      const items = (await screen.findByRole('heading', { name: /pedido n.º 7/i })).closest(
        'section',
      )!;
      expect(within(items).getByText(/2 × válvula tv05/i)).toBeInTheDocument();
      expect(within(items).getByTestId('order-total')).toHaveTextContent(/220\.000/);
    });

    it('should invite to prepare the smart home, with no guide button yet', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ order: erpOrder() })));
      renderOrder();

      expect(
        await screen.findByText(/querés ir preparando tu hogar inteligente/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/smart life o tuya smart/i)).toBeInTheDocument();
      expect(screen.queryByText(/guía rápida/i)).toBeNull();
      expect(screen.queryByText(/tiempo estimado|despacho|webpay|transbank/i)).toBeNull();
    });

    it('should not invite to prepare the smart home on an expired order', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(jsonResponse({ order: erpOrder({ status: 'expired' }) })),
      );
      renderOrder();

      await screen.findByText(/este pedido venció/i);
      expect(screen.queryByText(/hogar inteligente/i)).toBeNull();
    });

    it('should link to the catalog and offer WhatsApp only with a number', async () => {
      // Una respuesta nueva por llamada: el cuerpo de un `Response` se lee una sola vez.
      vi.stubGlobal(
        'fetch',
        vi.fn().mockImplementation(() => Promise.resolve(jsonResponse({ order: erpOrder() }))),
      );
      const { unmount } = renderOrder();

      expect(
        await screen.findByRole('link', { name: /seguir explorando productos/i }),
      ).toHaveAttribute('href', '/catalogo');
      expect(screen.queryByText(/tenés preguntas sobre tu pedido/i)).toBeNull();
      unmount();

      vi.stubEnv('VITE_WHATSAPP_NUMBER', '5491122334455');
      renderOrder();
      expect(await screen.findByText(/tenés preguntas sobre tu pedido/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /escribinos por whatsapp/i })).toHaveAttribute(
        'href',
        'https://wa.me/5491122334455',
      );
    });
  });

  it('should say the order does not exist on a 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(jsonResponse({ errors: { detail: 'No encontramos el pedido' } }, 404)),
    );
    renderOrder('nope');

    expect(await screen.findByText(/no encontramos este pedido/i)).toBeInTheDocument();
  });

  it('should ask to try again when the ERP does not answer', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    renderOrder();

    expect(await screen.findByText(/no pudimos cargar tu pedido/i)).toBeInTheDocument();
  });
});
