import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useShippingQuote } from '@/features/checkout/useShippingQuote';
import type { ShippingQuoteRequest } from '@/features/checkout/shippingApi';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const INPUT: ShippingQuoteRequest = {
  province: 'B',
  postalCode: '1704',
  items: [{ sku: 'SKU-1', quantity: 1 }],
};

const OPTION = { token: 'tok-quote', name: 'Envío a domicilio', price: 8_500, delivery_time: null };

describe('useShippingQuote', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_STORE_API_KEY', 'clave');
    vi.stubEnv('VITE_STORE_API_URL', 'https://erp.test');
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should stay idle without a complete input and not call the ERP', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useShippingQuote(null));

    expect(result.current.state).toEqual({ status: 'idle' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should load and then show the first option', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ options: [OPTION] })));

    const { result } = renderHook(() => useShippingQuote(INPUT));

    expect(result.current.state).toEqual({ status: 'loading' });
    await waitFor(() => expect(result.current.state.status).toBe('ready'));
    expect(result.current.state).toMatchObject({ option: { token: 'tok-quote', price: 8_500 } });
  });

  it.each([
    ['no option', () => Promise.resolve(jsonResponse({ options: [] }))],
    ['a 404 while the ERP has no shipping', () => Promise.resolve(jsonResponse({}, 404))],
    ['a 422 for products without size', () => Promise.resolve(jsonResponse({}, 422))],
    ['a network failure', () => Promise.reject(new TypeError('Failed to fetch'))],
  ])('should be unavailable with %s', async (_case, answer) => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(answer));

    const { result } = renderHook(() => useShippingQuote(INPUT));

    await waitFor(() => expect(result.current.state).toEqual({ status: 'unavailable' }));
  });

  it('should say the postal code is not from the province when the ERP rejects the pair', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ errors: { postal_code: ['no es de esa provincia'] } }, 422),
        ),
    );

    const { result } = renderHook(() => useShippingQuote(INPUT));

    await waitFor(() => expect(result.current.state).toEqual({ status: 'wrong_postal_code' }));
  });

  it('should be unavailable without the store key, without calling the ERP', () => {
    vi.stubEnv('VITE_STORE_API_KEY', '');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useShippingQuote(INPUT));

    expect(result.current.state).toEqual({ status: 'unavailable' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should not ask again while the input stays the same across renders', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => Promise.resolve(jsonResponse({ options: [OPTION] })));
    vi.stubGlobal('fetch', fetchMock);

    const { result, rerender } = renderHook(
      ({ input }: { input: ShippingQuoteRequest }) => useShippingQuote(input),
      { initialProps: { input: INPUT } },
    );
    await waitFor(() => expect(result.current.state.status).toBe('ready'));
    rerender({ input: { ...INPUT, items: [...INPUT.items] } });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should quote again when the postal code changes', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => Promise.resolve(jsonResponse({ options: [OPTION] })));
    vi.stubGlobal('fetch', fetchMock);

    const { result, rerender } = renderHook(
      ({ input }: { input: ShippingQuoteRequest }) => useShippingQuote(input),
      { initialProps: { input: INPUT } },
    );
    await waitFor(() => expect(result.current.state.status).toBe('ready'));
    rerender({ input: { ...INPUT, postalCode: '1406' } });

    expect(result.current.state).toEqual({ status: 'loading' });
    await waitFor(() => expect(result.current.state.status).toBe('ready'));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should ask for a new quote on refresh', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => Promise.resolve(jsonResponse({ options: [OPTION] })));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useShippingQuote(INPUT));
    await waitFor(() => expect(result.current.state.status).toBe('ready'));
    act(() => result.current.refresh());

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});
