import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { CartProvider } from '@/features/cart/CartProvider';
import { useCart } from '@/features/cart/useCart';
import type { Product } from '@/types';
import { buildProduct } from '../../helpers/builders';

const STORAGE_KEY = 'ezyhome_cart';

// Catálogo vigente. Los precios aquí son la fuente de verdad: un carrito
// persistido con precios viejos debe reconciliarse contra este dataset.
// See DOMAIN.md › Risk Posture (carrito persistente) y la actualización
// periódica de precios en `src/data/products.json`.
vi.mock('@/data/products.json', () => ({
  default: [
    {
      id: 'p-1',
      name: 'Foco Inteligente',
      description: 'Foco LED Wi-Fi 9W',
      price: 20000,
      images: ['/images/foco-nuevo.jpg'],
      category: 'Iluminación Inteligente',
      isBestseller: false,
      isOnSale: false,
      active: true,
    },
    {
      id: 'p-2',
      name: 'Sensor de Movimiento',
      description: 'Sensor PIR Zigbee',
      price: 15000,
      promotionalPrice: 11000,
      images: ['/images/sensor.jpg'],
      category: 'Seguridad',
      isBestseller: false,
      isOnSale: true,
      active: true,
    },
  ],
}));

const persist = (items: { product: Product; quantity: number }[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const wrapper = ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>;

describe('CartProvider — reconciliación con el catálogo al hidratar', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('should refresh a persisted item price from the current catalog', () => {
    persist([{ product: buildProduct({ id: 'p-1', price: 12500 }), quantity: 1 }]);

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items[0]?.product.price).toBe(20000);
  });

  it('should compute the total from catalog prices, not from the persisted snapshot', () => {
    persist([{ product: buildProduct({ id: 'p-1', price: 12500 }), quantity: 3 }]);

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.total).toBe(20000 * 3);
  });

  it('should preserve the persisted quantity while refreshing the product data', () => {
    persist([{ product: buildProduct({ id: 'p-1' }), quantity: 4 }]);

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.quantity).toBe(4);
    expect(result.current.items[0]?.product.images).toEqual(['/images/foco-nuevo.jpg']);
  });

  it('should pick up a promotion that started after the cart was persisted', () => {
    persist([
      {
        product: buildProduct({ id: 'p-2', name: 'Sensor de Movimiento', price: 15000 }),
        quantity: 2,
      },
    ]);

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items[0]?.product.isOnSale).toBe(true);
    expect(result.current.items[0]?.product.promotionalPrice).toBe(11000);
    expect(result.current.total).toBe(11000 * 2);
  });

  it('should drop a stale promotional price when the product is no longer on sale', () => {
    persist([
      {
        product: buildProduct({ id: 'p-1', isOnSale: true, promotionalPrice: 8000 }),
        quantity: 1,
      },
    ]);

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items[0]?.product.isOnSale).toBe(false);
    expect(result.current.total).toBe(20000);
  });

  it('should keep an item whose product is no longer in the catalog', () => {
    // DOMAIN.md: el carrito nunca puede perderse sin acción explícita del
    // usuario — un id desconocido conserva su snapshot en vez de desaparecer.
    persist([
      { product: buildProduct({ id: 'desconocido', name: 'Producto viejo' }), quantity: 2 },
    ]);

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.product.name).toBe('Producto viejo');
    expect(result.current.items[0]?.quantity).toBe(2);
  });

  it('should ignore a persisted entry that is not a valid cart item', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([{ nope: true }, null, 'x']));

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toEqual([]);
  });
});
