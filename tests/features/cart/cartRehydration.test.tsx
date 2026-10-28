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
      sku: 'FOCO-NUEVO',
      name: 'Foco Inteligente',
      description: 'Foco LED Wi-Fi 9W',
      images: ['/images/foco-nuevo.jpg'],
      category: 'Iluminación Inteligente',
      isBestseller: false,
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

  it('should refresh the persisted SKU from the current catalog, since prices are asked by SKU', () => {
    persist([{ product: buildProduct({ id: 'p-1', sku: 'FOCO-VIEJO' }), quantity: 1 }]);

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items[0]?.product.sku).toBe('FOCO-NUEVO');
  });

  it('should preserve the persisted quantity while refreshing the product data', () => {
    persist([{ product: buildProduct({ id: 'p-1' }), quantity: 4 }]);

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.quantity).toBe(4);
    expect(result.current.items[0]?.product.images).toEqual(['/images/foco-nuevo.jpg']);
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

  it('should give an empty SKU to an old snapshot without one, so it shows without price', () => {
    const { sku: _sku, ...withoutSku } = buildProduct({ id: 'desconocido' });
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ product: withoutSku, quantity: 1 }]),
    );

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items[0]?.product.sku).toBe('');
  });

  it('should ignore a persisted entry that is not a valid cart item', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([{ nope: true }, null, 'x']));

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toEqual([]);
  });
});
