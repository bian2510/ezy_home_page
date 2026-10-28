import { describe, expect, it } from 'vitest';
import {
  findMissingSkus,
  indexQuotes,
  isPurchasable,
  resolvePricing,
  unavailableLabel,
} from '@/features/pricing/pricingUtils';
import type { StoreQuote } from '@/features/pricing/storeApi';
import { buildProduct } from '../../helpers/builders';

const quote = (overrides: Partial<StoreQuote> = {}): StoreQuote => ({
  sku: 'SNS-001',
  priceMp: 21_000,
  priceTransfer: 20_000,
  stock: 3,
  available: true,
  ...overrides,
});

const product = buildProduct({ sku: 'SNS-001' });

describe('resolvePricing', () => {
  it('should show only the transfer price while Mercado Pago is not enabled', () => {
    const pricing = resolvePricing(product, 'ready', indexQuotes([quote()]), {
      mercadoPagoEnabled: false,
    });

    expect(pricing).toEqual({ price: 20_000, transferPrice: null, availability: 'available' });
  });

  it('should use the ERP prices when the SKU has a quote', () => {
    const pricing = resolvePricing(product, 'ready', indexQuotes([quote()]));

    expect(pricing).toEqual({ price: 21_000, transferPrice: 20_000, availability: 'available' });
  });

  it('should match the SKU ignoring case and surrounding spaces, like the ERP', () => {
    const pricing = resolvePricing(
      buildProduct({ sku: ' sns-001 ' }),
      'ready',
      indexQuotes([quote()]),
    );

    expect(pricing.price).toBe(21_000);
  });

  it('should hide the transfer price when it is not lower than the Mercado Pago price', () => {
    const pricing = resolvePricing(
      product,
      'ready',
      indexQuotes([quote({ priceTransfer: 21_000 })]),
    );

    expect(pricing.transferPrice).toBeNull();
  });

  it('should mark the product out of stock when the ERP says it is not available', () => {
    const pricing = resolvePricing(
      product,
      'ready',
      indexQuotes([quote({ stock: 0, available: false })]),
    );

    expect(pricing.availability).toBe('out_of_stock');
  });

  it('should ask to consult the price when the ERP did not return its SKU', () => {
    const pricing = resolvePricing(product, 'ready', indexQuotes([]));

    expect(pricing).toEqual({ price: null, transferPrice: null, availability: 'no_price' });
  });

  it('should never use the JSON price when the ERP could not be read', () => {
    const pricing = resolvePricing(product, 'unavailable', indexQuotes([quote()]));

    expect(pricing).toEqual({ price: null, transferPrice: null, availability: 'no_price' });
  });

  it('should have no price while the ERP answer is loading', () => {
    const pricing = resolvePricing(product, 'loading', indexQuotes([]));

    expect(pricing).toEqual({ price: null, transferPrice: null, availability: 'loading' });
  });
});

describe('isPurchasable and unavailableLabel', () => {
  it('should let the visitor buy only when the ERP says it is available', () => {
    expect(isPurchasable('available')).toBe(true);
    expect(unavailableLabel('available')).toBeNull();
  });

  it('should block the purchase while loading, without a label', () => {
    expect(isPurchasable('loading')).toBe(false);
    expect(unavailableLabel('loading')).toBeNull();
  });

  it('should block the purchase with a label when out of stock or without price', () => {
    expect(isPurchasable('out_of_stock')).toBe(false);
    expect(isPurchasable('no_price')).toBe(false);
    expect(unavailableLabel('out_of_stock')).toBe('Sin stock');
    expect(unavailableLabel('no_price')).toBe('Consultar precio');
  });
});

describe('findMissingSkus', () => {
  it('should list the SKUs the ERP did not return', () => {
    const products = [buildProduct({ sku: 'SNS-001' }), buildProduct({ sku: 'VIEJO-1' })];

    expect(findMissingSkus(products, indexQuotes([quote()]))).toEqual(['VIEJO-1']);
  });
});
