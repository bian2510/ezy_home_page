import { describe, expect, it } from 'vitest';
import {
  buildCategoryCards,
  outOfStockLast,
  productCountLabel,
  selectFeaturedProducts,
} from '@/features/home/homeUtils';
import type { Availability, Product } from '@/types';
import { buildProduct } from '../../helpers/builders';

const ids = (products: { id: string }[]) => products.map((product) => product.id);

describe('selectFeaturedProducts', () => {
  it('should take only the flagged products, alternating categories in their catalog order', () => {
    const products = [
      buildProduct({ id: 'luz-1', category: 'Iluminación', isBestseller: true }),
      buildProduct({ id: 'luz-2', category: 'Iluminación', isBestseller: true }),
      buildProduct({ id: 'luz-3', category: 'Iluminación', isBestseller: true }),
      buildProduct({ id: 'seg-1', category: 'Seguridad', isBestseller: true }),
      buildProduct({ id: 'sin-marca', category: 'Seguridad', isBestseller: false }),
      buildProduct({ id: 'hub-1', category: 'Hubs', isBestseller: true }),
    ];

    expect(ids(selectFeaturedProducts(products, 4))).toEqual(['luz-1', 'seg-1', 'hub-1', 'luz-2']);
  });

  it('should never pick an inactive product, even if it is flagged', () => {
    const products = [
      buildProduct({ id: 'oculto', isBestseller: true, active: false }),
      buildProduct({ id: 'visible', isBestseller: true }),
    ];

    expect(ids(selectFeaturedProducts(products, 8))).toEqual(['visible']);
  });

  it('should fall back to the first active products when none is flagged', () => {
    const products = [
      buildProduct({ id: 'oculto', active: false }),
      buildProduct({ id: 'a', category: 'Confort' }),
      buildProduct({ id: 'b', category: 'Confort' }),
      buildProduct({ id: 'c', category: 'Seguridad' }),
    ];

    expect(ids(selectFeaturedProducts(products, 2))).toEqual(['a', 'c']);
  });

  it('should keep a product without category in the selection', () => {
    const products = [
      buildProduct({ id: 'sin-cat', category: null, isBestseller: true }),
      buildProduct({ id: 'con-cat', category: 'Confort', isBestseller: true }),
    ];

    expect(ids(selectFeaturedProducts(products, 8))).toEqual(['sin-cat', 'con-cat']);
  });

  it('should return an empty list when there are no active products', () => {
    expect(selectFeaturedProducts([buildProduct({ active: false })], 8)).toEqual([]);
  });
});

describe('buildCategoryCards', () => {
  it('should build one card per active category with its real count and catalog link', () => {
    const products = [
      buildProduct({ id: '1', category: 'Iluminación Inteligente' }),
      buildProduct({ id: '2', category: 'Seguridad' }),
      buildProduct({ id: '3', category: 'Iluminación Inteligente' }),
      buildProduct({ id: '4', category: 'Hubs', active: false }),
      buildProduct({ id: '5', category: null }),
    ];

    expect(
      buildCategoryCards(products, { Seguridad: 'Sensores y cerraduras.' }).map(
        ({ category, count, href, description }) => ({ category, count, href, description }),
      ),
    ).toEqual([
      {
        category: 'Iluminación Inteligente',
        count: 2,
        href: `/catalogo?category=${encodeURIComponent('Iluminación Inteligente')}`,
        description: undefined,
      },
      {
        category: 'Seguridad',
        count: 1,
        href: '/catalogo?category=Seguridad',
        description: 'Sensores y cerraduras.',
      },
    ]);
  });
});

describe('productCountLabel', () => {
  it('should use the singular for one product and the plural otherwise', () => {
    expect(productCountLabel(1)).toBe('Ver 1 producto');
    expect(productCountLabel(13)).toBe('Ver 13 productos');
  });
});

describe('outOfStockLast', () => {
  const products = ['a', 'b', 'c', 'd'].map((id) => buildProduct({ id }));
  const availabilityFrom =
    (map: Record<string, Availability>) =>
    (product: Product): Availability =>
      map[product.id] ?? 'available';

  it('should move the products without stock to the end, keeping the order of both groups', () => {
    const sorted = outOfStockLast(
      products,
      availabilityFrom({ a: 'out_of_stock', c: 'out_of_stock' }),
    );

    expect(ids(sorted)).toEqual(['b', 'd', 'a', 'c']);
  });

  it('should keep the order while the ERP has not answered yet', () => {
    expect(ids(outOfStockLast(products, () => 'loading'))).toEqual(['a', 'b', 'c', 'd']);
  });

  it('should keep the order when the ERP failed and every product says "Consultar precio"', () => {
    expect(ids(outOfStockLast(products, () => 'no_price'))).toEqual(['a', 'b', 'c', 'd']);
  });

  it('should not move a product without price: only "sin stock" goes last', () => {
    const sorted = outOfStockLast(products, availabilityFrom({ a: 'no_price', b: 'out_of_stock' }));

    expect(ids(sorted)).toEqual(['a', 'c', 'd', 'b']);
  });
});
