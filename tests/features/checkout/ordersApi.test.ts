import { afterEach, describe, expect, it, vi } from 'vitest';
import { OrderApiError, createOrder, fetchOrder } from '@/features/checkout/ordersApi';
import type { OrderRequest } from '@/features/checkout/ordersApi';

const CONFIG = { baseUrl: 'https://erp.test', apiKey: 'clave' };

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
  expires_at: '2026-10-31T12:00:00Z',
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

const REQUEST: OrderRequest = {
  idempotencyKey: 'intento-abc12345',
  buyer: { name: 'Ana Pérez', phone: '1155554444', email: 'ana@mail.com', document: '' },
  items: [{ sku: 'SKU-AUTO-43091', quantity: 2 }],
  acceptedPrivacy: true,
};

describe('createOrder', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should POST the order with the key, without prices, and translate the answer', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ order: erpOrder() }, 201));
    vi.stubGlobal('fetch', fetchMock);

    const result = await createOrder(REQUEST, CONFIG);

    expect(result.created).toBe(true);
    expect(result.order).toMatchObject({
      token: 'tok-123',
      number: 7,
      total: 220_000,
      expiresAt: '2026-10-31T12:00:00Z',
      transfer: { alias: 'ezyhome.tienda', holder: 'EzyHome SRL' },
      pickup: { address: 'Av. Siempreviva 742' },
    });
    expect(result.order.items[0]).toEqual({
      sku: 'SKU-AUTO-43091',
      name: 'Válvula TV05',
      quantity: 2,
      unitPrice: 110_000,
      lineTotal: 220_000,
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://erp.test/api/store/orders');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({
      'x-api-key': 'clave',
      'content-type': 'application/json',
    });
    expect(JSON.parse(init.body as string)).toEqual({
      idempotency_key: 'intento-abc12345',
      payment_method: 'transfer',
      accepted_privacy: true,
      buyer: { name: 'Ana Pérez', phone: '1155554444', email: 'ana@mail.com' },
      items: [{ sku: 'SKU-AUTO-43091', quantity: 2 }],
    });
  });

  it('should send the DNI only when the buyer gave one', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ order: erpOrder() }, 201));
    vi.stubGlobal('fetch', fetchMock);

    await createOrder({ ...REQUEST, buyer: { ...REQUEST.buyer, document: '30123456' } }, CONFIG);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const sent = JSON.parse(init.body as string) as { buyer: { document?: string } };
    expect(sent.buyer.document).toBe('30123456');
  });

  it('should tell apart a repeated attempt (200) from a new order (201)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ order: erpOrder() }, 200)));

    expect((await createOrder(REQUEST, CONFIG)).created).toBe(false);
  });

  it('should throw with the units available when there is not enough stock (409)', async () => {
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

    const error = await createOrder(REQUEST, CONFIG).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(OrderApiError);
    expect(error).toMatchObject({
      status: 409,
      detail: 'No hay stock suficiente',
      stockIssues: [{ sku: 'SKU-AUTO-43091', available: 1 }],
    });
  });

  it('should throw with the errors per field when the data is invalid (422)', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ errors: { buyer_phone: ['debe tener de 8 a 20 números'] } }, 422),
        ),
    );

    const error = await createOrder(REQUEST, CONFIG).catch((caught: unknown) => caught);

    expect(error).toMatchObject({
      status: 422,
      detail: null,
      fieldErrors: { buyer_phone: ['debe tener de 8 a 20 números'] },
    });
  });

  it('should throw with the ERP message on 429', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ errors: { detail: 'Hiciste muchos pedidos seguidos.' } }, 429),
        ),
    );

    const error = await createOrder(REQUEST, CONFIG).catch((caught: unknown) => caught);

    expect(error).toMatchObject({ status: 429, detail: 'Hiciste muchos pedidos seguidos.' });
  });

  it('should throw an OrderApiError without details when the error body is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('boom', { status: 500 })));

    const error = await createOrder(REQUEST, CONFIG).catch((caught: unknown) => caught);

    expect(error).toMatchObject({ status: 500, detail: null, stockIssues: [] });
  });

  it('should let a network failure through for the caller', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(createOrder(REQUEST, CONFIG)).rejects.toThrow(TypeError);
  });

  it('should reject an answer that does not look like an order', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ order: { token: 1 } }, 201)));

    await expect(createOrder(REQUEST, CONFIG)).rejects.toThrow(/respuesta/i);
  });
});

describe('fetchOrder', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should read the order by its token with the key', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ order: erpOrder() }));
    vi.stubGlobal('fetch', fetchMock);

    const order = await fetchOrder('tok-123', CONFIG);

    expect(order.number).toBe(7);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://erp.test/api/store/orders/tok-123');
    expect(init.headers).toMatchObject({ 'x-api-key': 'clave' });
  });

  it('should escape the token in the URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ order: erpOrder() }));
    vi.stubGlobal('fetch', fetchMock);

    await fetchOrder('a/b?c', CONFIG);

    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://erp.test/api/store/orders/a%2Fb%3Fc');
  });

  it('should throw a 404 OrderApiError when the order does not exist', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(jsonResponse({ errors: { detail: 'No encontramos el pedido' } }, 404)),
    );

    const error = await fetchOrder('nope', CONFIG).catch((caught: unknown) => caught);

    expect(error).toMatchObject({ status: 404 });
  });
});
