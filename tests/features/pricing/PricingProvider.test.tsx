import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { PricingProvider, usePricing } from '@/features/pricing';
import { buildProduct } from '../../helpers/builders';

vi.mock('@/data/catalog', () => ({
  activeProducts: [
    { id: 'MLA1', sku: 'SNS-001' },
    { id: 'MLA2', sku: 'VIEJO-1' },
  ],
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <PricingProvider>{children}</PricingProvider>
);

const okResponse = () =>
  new Response(
    JSON.stringify({
      products: [
        { sku: 'SNS-001', price_mp: 21_000, price_transfer: 20_000, stock: 3, available: true },
      ],
    }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );

describe('PricingProvider', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.stubEnv('VITE_STORE_API_KEY', 'clave');
    vi.stubEnv('VITE_STORE_API_URL', 'https://erp.test');
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    warnSpy.mockRestore();
  });

  it('should show only the transfer price while Mercado Pago is not enabled', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse()));

    const { result } = renderHook(() => usePricing(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.pricingOf(buildProduct({ sku: 'SNS-001' }))).toEqual({
      price: 20_000,
      transferPrice: null,
      availability: 'available',
    });
  });

  it('should ask the ERP once for every active SKU and expose its prices', async () => {
    vi.stubEnv('VITE_MERCADOPAGO_ENABLED', 'true');
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => usePricing(), { wrapper });

    expect(result.current.pricingOf(buildProduct({ sku: 'SNS-001' })).availability).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.pricingOf(buildProduct({ sku: 'SNS-001' }))).toEqual({
      price: 21_000,
      transferPrice: 20_000,
      availability: 'available',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      'https://erp.test/api/store/products?skus=SNS-001%2CVIEJO-1',
    );
  });

  it('should warn about the SKUs the ERP did not return', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse()));

    const { result } = renderHook(() => usePricing(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('VIEJO-1'));
  });

  it('should ask to consult prices when the ERP fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')));

    const { result } = renderHook(() => usePricing(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe('unavailable'));
    expect(result.current.pricingOf(buildProduct({ sku: 'SNS-001' })).availability).toBe(
      'no_price',
    );
  });

  it('should not call the ERP when there is no API key', () => {
    vi.stubEnv('VITE_STORE_API_KEY', '');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => usePricing(), { wrapper });

    expect(result.current.status).toBe('unavailable');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should fail loudly when used outside its provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => renderHook(() => usePricing())).toThrow('PricingProvider');
  });
});
