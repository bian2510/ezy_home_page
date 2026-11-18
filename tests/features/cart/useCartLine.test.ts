import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCartLine } from '@/features/cart/useCartLine';
import { buildCartItem } from '../../helpers/builders';
import type { ProductPricing } from '@/types';

let pricing: ProductPricing = { price: 21000, transferPrice: 20000, availability: 'available' };
vi.mock('@/features/pricing/usePricing', () => ({
  usePricing: () => ({ status: 'ready', pricingOf: () => pricing }),
}));

const addToast = vi.fn();
vi.mock('@/features/toast/useToast', () => ({
  useToast: () => ({ toasts: [], addToast, removeToast: vi.fn() }),
}));

const buildActions = () => ({ onIncrement: vi.fn(), onDecrement: vi.fn(), onRemove: vi.fn() });

describe('useCartLine', () => {
  afterEach(() => {
    pricing = { price: 21000, transferPrice: 20000, availability: 'available' };
    addToast.mockClear();
  });

  it('should price the line with the transfer price', () => {
    const { result } = renderHook(() =>
      useCartLine(buildCartItem({ quantity: 2 }), buildActions()),
    );

    expect(result.current.linePrice?.line).toBe(40000);
  });

  it('should have no line price without an ERP price', () => {
    pricing = { price: null, transferPrice: null, availability: 'no_price' };
    const { result } = renderHook(() => useCartLine(buildCartItem(), buildActions()));

    expect(result.current.linePrice).toBeNull();
  });

  it('should flag the stock limit when the quantity reaches the ERP stock', () => {
    pricing = { ...pricing, stock: 2 };
    const { result } = renderHook(() =>
      useCartLine(buildCartItem({ quantity: 2 }), buildActions()),
    );

    expect(result.current.atMaximum).toBe(true);
    expect(result.current.stock).toBe(2);
  });

  it('should translate the selector value into increment or decrement', () => {
    const actions = buildActions();
    const { result } = renderHook(() => useCartLine(buildCartItem({ quantity: 2 }), actions));

    result.current.changeQuantity(3);
    result.current.changeQuantity(1);

    expect(actions.onIncrement).toHaveBeenCalledWith('p-1');
    expect(actions.onDecrement).toHaveBeenCalledWith('p-1');
  });

  it('should remove the product and tell it with a toast', () => {
    const actions = buildActions();
    const { result } = renderHook(() => useCartLine(buildCartItem(), actions));

    result.current.remove();

    expect(actions.onRemove).toHaveBeenCalledWith('p-1');
    expect(addToast).toHaveBeenCalledWith('Foco Inteligente eliminado del carrito', 'info');
  });
});
