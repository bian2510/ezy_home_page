import { describe, expect, it } from 'vitest';
import {
  clampToStock,
  findMissingSkus,
  reachedStockLimit,
  indexQuotes,
  isPurchasable,
  resolvePricing,
  transferDiscountPercent,
  transferSavings,
  unavailableLabel,
} from '@/features/pricing/pricingUtils';
import type { StoreQuote } from '@/features/pricing/storeApi';
import { buildProduct } from '../../helpers/builders';
import type { ProductPricing } from '@/types';

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

    expect(pricing).toEqual({
      price: 20_000,
      transferPrice: null,
      availability: 'available',
      stock: 3,
    });
  });

  it('should use the ERP prices when the SKU has a quote', () => {
    const pricing = resolvePricing(product, 'ready', indexQuotes([quote()]));

    expect(pricing).toEqual({
      price: 21_000,
      transferPrice: 20_000,
      availability: 'available',
      stock: 3,
    });
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

describe('stock limit', () => {
  const pricing = (stock?: number): ProductPricing => ({
    price: 1000,
    transferPrice: null,
    availability: stock === 0 ? 'out_of_stock' : 'available',
    ...(stock === undefined ? {} : { stock }),
  });

  it('should reach the limit when the quantity equals the ERP stock', () => {
    expect(reachedStockLimit(pricing(3), 2)).toBe(false);
    expect(reachedStockLimit(pricing(3), 3)).toBe(true);
    expect(reachedStockLimit(pricing(3), 4)).toBe(true);
  });

  it('should not limit when the ERP did not give a stock', () => {
    expect(reachedStockLimit(pricing(), 50)).toBe(false);
  });

  it('should lower a quantity above the stock to the stock', () => {
    expect(clampToStock(pricing(3), 5)).toBe(3);
    expect(clampToStock(pricing(3), 2)).toBe(2);
  });

  it('should keep the quantity when the stock is unknown or zero', () => {
    expect(clampToStock(pricing(), 5)).toBe(5);
    expect(clampToStock(pricing(0), 5)).toBe(5);
  });
});

describe('transferDiscountPercent', () => {
  const priced = (price: number | null, transferPrice: number | null): ProductPricing => ({
    price,
    transferPrice,
    availability: 'available',
  });

  it('should return the transfer discount over the Mercado Pago price', () => {
    expect(transferDiscountPercent(priced(20_000, 19_000))).toBe(5);
  });

  it('should round to the nearest whole percent (usuario, 2026-11-03)', () => {
    // 18.900 → 18.000 es un 4,76 %: se muestra 5 %.
    expect(transferDiscountPercent(priced(18_900, 18_000))).toBe(5);
  });

  it('should round up from half a point and down below it', () => {
    expect(transferDiscountPercent(priced(1_000, 955))).toBe(5); // 4,5 %
    expect(transferDiscountPercent(priced(1_000, 954))).toBe(5); // 4,6 %
    expect(transferDiscountPercent(priced(1_000, 956))).toBe(4); // 4,4 %
  });

  it('should return null when there is no cheaper transfer price', () => {
    // Sin Mercado Pago activo, `resolvePricing` no informa precio de transferencia.
    expect(transferDiscountPercent(priced(20_000, null))).toBeNull();
  });

  it('should return null when the ERP has no price', () => {
    expect(transferDiscountPercent(priced(null, null))).toBeNull();
  });

  it('should not lose a point to floating point error', () => {
    // (100 - 71) / 100 * 100 da 28,999… en coma flotante: tiene que dar 29.
    expect(transferDiscountPercent(priced(100, 71))).toBe(29);
    expect(transferDiscountPercent(priced(1000, 710))).toBe(29);
  });

  it('should return null when the transfer price is zero or negative', () => {
    // Un precio de transferencia en 0 es un dato roto del ERP, no un "-100%".
    expect(transferDiscountPercent(priced(20_000, 0))).toBeNull();
    expect(transferDiscountPercent(priced(20_000, -500))).toBeNull();
  });

  it('should return null when the Mercado Pago price is zero or negative', () => {
    expect(transferDiscountPercent(priced(0, 0))).toBeNull();
    expect(transferDiscountPercent(priced(-100, -200))).toBeNull();
  });

  it('should return null when the transfer price is not cheaper', () => {
    expect(transferDiscountPercent(priced(20_000, 20_000))).toBeNull();
    expect(transferDiscountPercent(priced(20_000, 21_000))).toBeNull();
  });

  it('should return null when the discount rounds to zero', () => {
    expect(transferDiscountPercent(priced(20_000, 19_950))).toBeNull(); // 0,25 %
    expect(transferDiscountPercent(priced(1_000, 996))).toBeNull(); // 0,4 %
  });

  it('should show 1% from half a point up', () => {
    expect(transferDiscountPercent(priced(1_000, 995))).toBe(1); // 0,5 %
  });
});

describe('transferSavings', () => {
  it('should be the real difference between the Mercado Pago and the transfer price', () => {
    expect(transferSavings({ price: 26300, transferPrice: 25000, availability: 'available' })).toBe(
      1300,
    );
  });

  it('should be null without a transfer price (Mercado Pago off, or not cheaper)', () => {
    expect(
      transferSavings({ price: 25000, transferPrice: null, availability: 'available' }),
    ).toBeNull();
  });

  it('should be null without an ERP price', () => {
    expect(
      transferSavings({ price: null, transferPrice: null, availability: 'no_price' }),
    ).toBeNull();
    expect(
      transferSavings({ price: null, transferPrice: null, availability: 'loading' }),
    ).toBeNull();
  });

  it('should be null when the difference is zero or negative (broken data)', () => {
    expect(
      transferSavings({ price: 25000, transferPrice: 25000, availability: 'available' }),
    ).toBeNull();
    expect(
      transferSavings({ price: 25000, transferPrice: 26000, availability: 'available' }),
    ).toBeNull();
  });
});
