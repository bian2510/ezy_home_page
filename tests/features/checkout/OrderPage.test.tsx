import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    expect(screen.getByTestId('order-total')).toHaveTextContent(/220\.000/);
    expect(screen.getByText('ezyhome.tienda')).toBeInTheDocument();
    expect(screen.getByText('0000003100012345678901')).toBeInTheDocument();
    expect(screen.getByText('EzyHome SRL')).toBeInTheDocument();
    expect(screen.getByText('Banco Galicia')).toBeInTheDocument();
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

    expect(await screen.findByText(/recibimos tu pago/i)).toBeInTheDocument();
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
