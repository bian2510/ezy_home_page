import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrderPage from '@/features/checkout/OrderPage';
import { goToExternalUrl } from '@/lib/redirect';

vi.mock('@/lib/redirect', () => ({ goToExternalUrl: vi.fn() }));

const CHECKOUT_URL = 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=1';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const mpOrder = (overrides: Record<string, unknown> = {}) => ({
  token: 'tok-mp',
  number: 8,
  status: 'pending_payment',
  payment_method: 'mercado_pago',
  total: 231_000,
  expires_at: '2026-10-30T12:30:00Z',
  checkout_url: null,
  checkout_error: false,
  items: [
    {
      sku: 'SKU-AUTO-43091',
      name: 'Válvula TV05',
      quantity: 2,
      unit_price: 115_500,
      line_total: 231_000,
    },
  ],
  // El ERP manda los datos de la tienda también en los pedidos de MP: el sitio
  // no los tiene que mostrar.
  transfer: { alias: 'ezyhome.tienda', cbu: null, holder: 'EzyHome SRL', bank: null },
  pickup: { address: 'Av. Siempreviva 742', hours: 'Lun a vie 10 a 18' },
  ...overrides,
});

const answer = (overrides: Record<string, unknown> = {}) =>
  Promise.resolve(jsonResponse({ order: mpOrder(overrides) }));

const renderOrder = (path = '/pedido/tok-mp', state: unknown = null) => {
  const [pathname = '', query] = path.split('?');
  return render(
    <MemoryRouter initialEntries={[{ pathname, search: query ? `?${query}` : '', state }]}>
      <Routes>
        <Route path="/pedido/:token" element={<OrderPage />} />
      </Routes>
    </MemoryRouter>,
  );
};

/** Deja correr los timers falsos y las promesas que destraban. */
const advance = async (ms = 0) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

const expectNoTransferData = () => {
  expect(screen.queryByText('ezyhome.tienda')).not.toBeInTheDocument();
  expect(screen.queryByText(/transferí a esta cuenta/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/en el concepto/i)).not.toBeInTheDocument();
};

describe('OrderPage with Mercado Pago', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    vi.setSystemTime(new Date('2026-10-30T12:00:00Z'));
    vi.stubEnv('VITE_STORE_API_KEY', 'clave');
    vi.stubEnv('VITE_STORE_API_URL', 'https://erp.test');
    vi.mocked(goToExternalUrl).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  describe('right after the checkout', () => {
    it('should poll every second and open Mercado Pago when the link arrives', async () => {
      const fetchMock = vi
        .fn()
        .mockImplementationOnce(() => answer())
        .mockImplementationOnce(() => answer())
        .mockImplementation(() => answer({ checkout_url: CHECKOUT_URL }));
      vi.stubGlobal('fetch', fetchMock);
      renderOrder('/pedido/tok-mp', { openMercadoPago: true });

      await advance();
      expect(screen.getByText(/abriendo mercado pago/i)).toBeInTheDocument();
      expectNoTransferData();
      expect(goToExternalUrl).not.toHaveBeenCalled();

      await advance(1000);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(goToExternalUrl).not.toHaveBeenCalled();

      await advance(1000);
      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(goToExternalUrl).toHaveBeenCalledWith(CHECKOUT_URL);
      expect(goToExternalUrl).toHaveBeenCalledTimes(1);

      await advance(5000);
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('should offer transfer and WhatsApp when Mercado Pago could not create the payment', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockImplementation(() => answer({ checkout_error: true })),
      );
      renderOrder('/pedido/tok-mp', { openMercadoPago: true });

      await advance();
      expect(
        screen.getByText(
          /no pudimos abrir mercado pago\. podés pagar por transferencia o escribirnos por whatsapp/i,
        ),
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /whatsapp/i })).toHaveAttribute(
        'href',
        expect.stringContaining('wa.me'),
      );
      expect(goToExternalUrl).not.toHaveBeenCalled();
      expectNoTransferData();
    });

    it('should give up after 15 s without a link and stop polling', async () => {
      const fetchMock = vi.fn().mockImplementation(() => answer());
      vi.stubGlobal('fetch', fetchMock);
      renderOrder('/pedido/tok-mp', { openMercadoPago: true });

      await advance();
      await advance(14_000);
      expect(screen.getByText(/abriendo mercado pago/i)).toBeInTheDocument();

      await advance(1000);
      expect(screen.getByText(/no pudimos abrir mercado pago/i)).toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledTimes(16);

      await advance(10_000);
      expect(fetchMock).toHaveBeenCalledTimes(16);
      expect(goToExternalUrl).not.toHaveBeenCalled();
    });

    it('should keep polling when one poll fails', async () => {
      const fetchMock = vi
        .fn()
        .mockImplementationOnce(() => answer())
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockImplementation(() => answer({ checkout_url: CHECKOUT_URL }));
      vi.stubGlobal('fetch', fetchMock);
      renderOrder('/pedido/tok-mp', { openMercadoPago: true });

      await advance();
      await advance(1000);
      expect(screen.getByText(/abriendo mercado pago/i)).toBeInTheDocument();
      await advance(1000);

      expect(goToExternalUrl).toHaveBeenCalledWith(CHECKOUT_URL);
    });
  });

  it('should show a pay button instead of redirecting when the buyer opens the page later', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => answer({ checkout_url: CHECKOUT_URL })),
    );
    renderOrder();

    await advance();
    expect(screen.getByRole('link', { name: /ir a pagar/i })).toHaveAttribute('href', CHECKOUT_URL);
    expect(goToExternalUrl).not.toHaveBeenCalled();
    expectNoTransferData();
  });

  describe('back from Mercado Pago', () => {
    it('should confirm the payment once the ERP marks the order paid', async () => {
      const fetchMock = vi
        .fn()
        .mockImplementationOnce(() => answer({ checkout_url: CHECKOUT_URL }))
        .mockImplementation(() => answer({ status: 'paid', checkout_url: CHECKOUT_URL }));
      vi.stubGlobal('fetch', fetchMock);
      renderOrder('/pedido/tok-mp?resultado=ok');

      await advance();
      expect(screen.getByText(/recibimos tu pago/i)).toBeInTheDocument();
      expectNoTransferData();

      await advance(2000);
      expect(
        screen.getByText(/pago confirmado\. te avisamos por email y whatsapp para el retiro/i),
      ).toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledTimes(2);

      await advance(10_000);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('should say the payment is still being confirmed after 30 s', async () => {
      const fetchMock = vi.fn().mockImplementation(() => answer({ checkout_url: CHECKOUT_URL }));
      vi.stubGlobal('fetch', fetchMock);
      renderOrder('/pedido/tok-mp?resultado=ok');

      await advance();
      await advance(28_000);
      expect(screen.queryByText(/estamos confirmando tu pago/i)).not.toBeInTheDocument();

      await advance(2000);
      expect(
        screen.getByText(/estamos confirmando tu pago con mercado pago\. te avisamos por email/i),
      ).toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledTimes(16);
      expect(goToExternalUrl).not.toHaveBeenCalled();
      expectNoTransferData();
    });

    it('should offer to retry with the same link when the payment failed', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockImplementation(() => answer({ checkout_url: CHECKOUT_URL })),
      );
      renderOrder('/pedido/tok-mp?resultado=error');

      await advance();
      expect(screen.getByText(/el pago no se completó/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /probar de nuevo/i })).toHaveAttribute(
        'href',
        CHECKOUT_URL,
      );
      expect(screen.getByRole('link', { name: /whatsapp/i })).toBeInTheDocument();
      expect(goToExternalUrl).not.toHaveBeenCalled();
      expectNoTransferData();
    });

    it('should not offer the old link when the order already expired', async () => {
      vi.stubGlobal(
        'fetch',
        vi
          .fn()
          .mockImplementation(() =>
            answer({ checkout_url: CHECKOUT_URL, expires_at: '2026-10-30T11:00:00Z' }),
          ),
      );
      renderOrder('/pedido/tok-mp?resultado=error');

      await advance();
      expect(screen.getByText(/el pago no se completó/i)).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /probar de nuevo/i })).not.toBeInTheDocument();
    });

    it('should say the payment is pending', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockImplementation(() => answer({ checkout_url: CHECKOUT_URL })),
      );
      renderOrder('/pedido/tok-mp?resultado=pendiente');

      await advance();
      expect(screen.getByText(/tu pago está pendiente/i)).toBeInTheDocument();
      expectNoTransferData();
    });
  });

  it.each([
    ['paid', /pago confirmado/i],
    ['expired', /venció porque no se completó el pago/i],
    ['canceled', /este pedido fue cancelado/i],
  ])('should show the %s Mercado Pago order without transfer data', async (status, text) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => answer({ status, checkout_url: CHECKOUT_URL })),
    );
    renderOrder();

    await advance();
    expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /ir a pagar/i })).not.toBeInTheDocument();
    expectNoTransferData();
  });

  it('should not offer to switch to transfer when it does not have the buyer data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => answer({ checkout_error: true })),
    );
    renderOrder();

    await advance();
    expect(screen.getByText(/no pudimos abrir mercado pago/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /pagar por transferencia/i }),
    ).not.toBeInTheDocument();
  });
});
