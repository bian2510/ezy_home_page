import { afterEach, describe, expect, it, vi } from 'vitest';
import { quoteShipping, type ShippingQuoteRequest } from '@/features/checkout/shippingApi';

const CONFIG = { baseUrl: 'https://erp.test', apiKey: 'clave' };

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const REQUEST: ShippingQuoteRequest = {
  province: 'B',
  postalCode: '1704',
  items: [{ sku: 'SKU-AUTO-43091', quantity: 2 }],
};

const erpOption = (overrides: Record<string, unknown> = {}) => ({
  token: 'cotizacion-de-prueba',
  carrier: 'own_rate',
  service: 'home',
  name: 'Envío a domicilio',
  price: 8_500,
  delivery_time: '3 a 5 días hábiles',
  expires_at: '2026-11-17T22:00:00Z',
  ...overrides,
});

describe('quoteShipping', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should POST the province, the postal code and the items with the key', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ options: [] }));
    vi.stubGlobal('fetch', fetchMock);

    await quoteShipping(REQUEST, CONFIG);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://erp.test/api/store/shipping/quotes');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({
      'x-api-key': 'clave',
      'content-type': 'application/json',
    });
    expect(JSON.parse(init.body as string)).toEqual({
      province: 'B',
      postal_code: '1704',
      items: [{ sku: 'SKU-AUTO-43091', quantity: 2 }],
    });
  });

  it('should translate the options the ERP quoted', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ options: [erpOption()] })));

    expect(await quoteShipping(REQUEST, CONFIG)).toEqual([
      {
        token: 'cotizacion-de-prueba',
        name: 'Envío a domicilio',
        price: 8_500,
        deliveryTime: '3 a 5 días hábiles',
      },
    ]);
  });

  it('should name the option "Envío a domicilio" when the ERP does not send a name', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ options: [erpOption({ name: undefined, delivery_time: null })] }),
        ),
    );

    const [option] = await quoteShipping(REQUEST, CONFIG);

    expect(option).toMatchObject({ name: 'Envío a domicilio', deliveryTime: null });
  });

  it('should drop the options that do not look like a quote', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          options: [erpOption({ token: 42 }), erpOption({ price: '8500' }), 'nada', erpOption()],
        }),
      ),
    );

    expect(await quoteShipping(REQUEST, CONFIG)).toHaveLength(1);
  });

  it('should return no options when the answer has no list', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ algo: 1 })));

    expect(await quoteShipping(REQUEST, CONFIG)).toEqual([]);
  });

  it.each([[404], [422], [500]])('should throw when the ERP answers %s', async (status) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ errors: {} }, status)));

    await expect(quoteShipping(REQUEST, CONFIG)).rejects.toThrow(String(status));
  });

  it('should pass the abort signal to fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ options: [] }));
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();

    await quoteShipping(REQUEST, CONFIG, controller.signal);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.signal).toBe(controller.signal);
  });
});
