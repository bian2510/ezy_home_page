import { describe, expect, it } from 'vitest';
import { resolvePurchase } from '@/features/product/productUtils';

describe('resolvePurchase', () => {
  it('should keep the chosen quantity when the ERP sends no stock', () => {
    expect(resolvePurchase(undefined, 0, 5)).toEqual({
      quantity: 5,
      max: undefined,
      noneLeft: false,
      atStockLimit: false,
    });
  });

  it('should cap the quantity at the stock left after what is already in the cart', () => {
    expect(resolvePurchase(3, 1, 5)).toEqual({
      quantity: 2,
      max: 2,
      noneLeft: false,
      atStockLimit: true,
    });
  });

  it('should flag that nothing is left when the cart already has all the stock', () => {
    expect(resolvePurchase(2, 2, 1)).toEqual({
      quantity: 1,
      max: 1,
      noneLeft: true,
      atStockLimit: true,
    });
  });

  it('should not be at the limit while there is room for more', () => {
    expect(resolvePurchase(10, 0, 2)).toEqual({
      quantity: 2,
      max: 10,
      noneLeft: false,
      atStockLimit: false,
    });
  });
});
