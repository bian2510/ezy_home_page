import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchStoreQuotes } from '@/features/pricing/storeApi';

const CONFIG = { baseUrl: 'https://erp.test', apiKey: 'clave' };

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const erpProduct = (sku: string, overrides: Record<string, unknown> = {}) => ({
  sku,
  price_mp: 21_000,
  price_transfer: 20_000,
  stock: 3,
  available: true,
  ...overrides,
});

describe('fetchStoreQuotes', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should ask the ERP for the SKUs with the API key and translate the response', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ products: [erpProduct('SNS-001')] }));
    vi.stubGlobal('fetch', fetchMock);

    const quotes = await fetchStoreQuotes(['SNS-001', 'CO-ZB-01'], CONFIG);

    expect(quotes).toEqual([
      { sku: 'SNS-001', priceMp: 21_000, priceTransfer: 20_000, stock: 3, available: true },
    ]);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://erp.test/api/store/products?skus=SNS-001%2CCO-ZB-01');
    expect(init.headers).toMatchObject({ 'x-api-key': 'clave' });
  });

  it('should split more than 200 SKUs into several requests', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => Promise.resolve(jsonResponse({ products: [] })));
    vi.stubGlobal('fetch', fetchMock);
    const skus = Array.from({ length: 201 }, (_, index) => `SKU-${index}`);

    await fetchStoreQuotes(skus, CONFIG);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should not call the ERP when there are no SKUs', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    expect(await fetchStoreQuotes([], CONFIG)).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should fail when the ERP answers with an error status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: 'no' }, 401)));

    await expect(fetchStoreQuotes(['SNS-001'], CONFIG)).rejects.toThrow('401');
  });

  it('should discard entries that do not have the expected shape', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          products: [erpProduct('SNS-001'), erpProduct('MAL', { price_mp: '21000' }), null],
        }),
      ),
    );

    const quotes = await fetchStoreQuotes(['SNS-001', 'MAL'], CONFIG);

    expect(quotes.map((quote) => quote.sku)).toEqual(['SNS-001']);
  });
});
