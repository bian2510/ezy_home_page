import { afterEach, describe, expect, it, vi } from 'vitest';
import { pixelLine, pixelParams, trackPixel } from '@/lib/metaPixel';

describe('pixelParams', () => {
  it('should describe the lines by SKU and add up the value in ARS', () => {
    const params = pixelParams([
      pixelLine({ id: 'p-1', sku: 'FOCO-001' }, 2, 10_000),
      pixelLine({ id: 'p-2', sku: 'TIRA-002' }, 1, 5_000),
    ]);

    expect(params).toEqual({
      content_ids: ['FOCO-001', 'TIRA-002'],
      contents: [
        { id: 'FOCO-001', quantity: 2, item_price: 10_000 },
        { id: 'TIRA-002', quantity: 1, item_price: 5_000 },
      ],
      content_type: 'product',
      currency: 'ARS',
      num_items: 3,
      value: 25_000,
    });
  });

  it('should fall back to the product id when it has no SKU', () => {
    expect(pixelLine({ id: 'p-9', sku: '' }, 1, null).id).toBe('p-9');
  });

  it('should leave the value out when a line has no price, instead of sending a low one', () => {
    const params = pixelParams([
      pixelLine({ id: 'p-1', sku: 'FOCO-001' }, 1, 10_000),
      pixelLine({ id: 'p-2', sku: 'TIRA-002' }, 1, null),
    ]);

    expect(params).not.toHaveProperty('value');
    expect(params.contents[1]).toEqual({ id: 'TIRA-002', quantity: 1 });
  });
});

describe('trackPixel', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const params = pixelParams([pixelLine({ id: 'p-1', sku: 'FOCO-001' }, 1, 10_000)]);

  it('should send the standard event to the Meta Pixel', () => {
    const fbq = vi.fn();
    vi.stubGlobal('fbq', fbq);

    trackPixel('AddToCart', params);

    expect(fbq).toHaveBeenCalledWith('track', 'AddToCart', params);
  });

  it('should pass the event id so Meta counts a repeated event once', () => {
    const fbq = vi.fn();
    vi.stubGlobal('fbq', fbq);

    trackPixel('Purchase', params, 'pedido-7');

    expect(fbq).toHaveBeenCalledWith('track', 'Purchase', params, { eventID: 'pedido-7' });
  });

  it('should do nothing when the Pixel did not load (blocker, no network)', () => {
    expect(() => trackPixel('AddToCart', params)).not.toThrow();
  });

  it('should never break the purchase when the Pixel throws', () => {
    vi.stubGlobal(
      'fbq',
      vi.fn(() => {
        throw new Error('fbevents roto');
      }),
    );

    expect(() => trackPixel('Purchase', params)).not.toThrow();
  });
});
