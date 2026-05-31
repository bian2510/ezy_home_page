import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { CartProvider } from '@/features/cart/CartProvider';
import { useCart } from '@/features/cart/useCart';
import type { Product } from '@/types';

const STORAGE_KEY = 'ezyhome_cart';

const buildProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'p-1',
  name: 'Foco Inteligente',
  description: 'Foco LED Wi-Fi 9W',
  price: 12500,
  images: ['/images/foco.jpg'],
  category: 'iluminacion',
  isBestseller: false,
  isOnSale: false,
  ...overrides,
});

const wrapper = ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>;

describe('CartContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('should add a product to the cart when addItem is called', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const product = buildProduct();

    act(() => {
      result.current.addItem(product);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.product.id).toBe('p-1');
    expect(result.current.items[0]?.quantity).toBe(1);
  });

  it('should increment quantity when addItem is called for an existing product', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const product = buildProduct();

    act(() => {
      result.current.addItem(product);
      result.current.addItem(product, 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.quantity).toBe(3);
  });

  it('should remove a product from the cart when removeItem is called', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const productA = buildProduct({ id: 'p-1' });
    const productB = buildProduct({ id: 'p-2', name: 'Sensor de Movimiento' });

    act(() => {
      result.current.addItem(productA);
      result.current.addItem(productB);
      result.current.removeItem('p-1');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.product.id).toBe('p-2');
  });

  it('should change quantity when updateQuantity is called', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const product = buildProduct();

    act(() => {
      result.current.addItem(product);
      result.current.updateQuantity('p-1', 5);
    });

    expect(result.current.items[0]?.quantity).toBe(5);
  });

  it('should clamp quantity to 1 when updateQuantity is called with a value below 1', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const product = buildProduct();

    act(() => {
      result.current.addItem(product, 3);
      result.current.updateQuantity('p-1', 0);
    });

    expect(result.current.items[0]?.quantity).toBe(1);

    act(() => {
      result.current.updateQuantity('p-1', -10);
    });

    expect(result.current.items[0]?.quantity).toBe(1);
  });

  it('should empty the cart when clearCart is called', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(buildProduct({ id: 'p-1' }));
      result.current.addItem(buildProduct({ id: 'p-2' }));
      result.current.clearCart();
    });

    expect(result.current.items).toEqual([]);
  });

  it('should compute total as the sum of price times quantity for every item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(buildProduct({ id: 'p-1', price: 10000 }), 2);
      result.current.addItem(buildProduct({ id: 'p-2', price: 5500 }), 3);
    });

    expect(result.current.total).toBe(10000 * 2 + 5500 * 3);
  });

  it('should compute itemCount as the sum of all item quantities', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(buildProduct({ id: 'p-1' }), 2);
      result.current.addItem(buildProduct({ id: 'p-2' }), 4);
    });

    expect(result.current.itemCount).toBe(6);
  });

  it('should hydrate items from localStorage on initialization', () => {
    const stored = [
      {
        product: buildProduct({ id: 'p-1', price: 12500 }),
        quantity: 2,
      },
    ];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(getItemSpy).toHaveBeenCalledWith(STORAGE_KEY);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.quantity).toBe(2);
    expect(result.current.total).toBe(12500 * 2);
  });

  it('should set storageAvailable to false when localStorage.setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(buildProduct());
    });

    expect(result.current.storageAvailable).toBe(false);
    expect(result.current.items).toHaveLength(1);
  });

  it('should throw a descriptive error when useCart is used outside CartProvider', () => {
    const renderOutsideProvider = () => renderHook(() => useCart());

    expect(renderOutsideProvider).toThrow(/CartProvider/);
  });

  it('should render children passed to CartProvider', () => {
    const { getByText } = render(
      <CartProvider>
        <p>child node</p>
      </CartProvider>,
    );

    expect(getByText('child node')).toBeInTheDocument();
  });
});
