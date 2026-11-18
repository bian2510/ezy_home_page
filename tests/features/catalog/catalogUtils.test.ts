import { describe, expect, it } from 'vitest';
import {
  countByCategory,
  matchesQuery,
  outOfStockLast,
  selectRelatedProducts,
} from '@/features/catalog/catalogUtils';
import type { Availability, Product } from '@/types';
import { buildProduct } from '../../helpers/builders';

describe('matchesQuery', () => {
  const plug = buildProduct({ name: 'Enchufe Inteligente WiFi', category: 'Confort' });

  it('should match every product when the query is empty or blank', () => {
    expect(matchesQuery(plug, '')).toBe(true);
    expect(matchesQuery(plug, '   ')).toBe(true);
  });

  it('should match the name ignoring case and accents', () => {
    expect(matchesQuery(plug, 'ENCHUFE')).toBe(true);
    expect(matchesQuery(buildProduct({ name: 'Cámara Exterior' }), 'camara')).toBe(true);
  });

  it('should match the category', () => {
    expect(matchesQuery(plug, 'confort')).toBe(true);
  });

  it('should require every word, in any order', () => {
    expect(matchesQuery(plug, 'wifi enchufe')).toBe(true);
    expect(matchesQuery(plug, 'enchufe zigbee')).toBe(false);
  });

  it('should not match the long description, to keep results relevant', () => {
    const product = buildProduct({ name: 'Foco', description: 'Compatible con Alexa' });
    expect(matchesQuery(product, 'alexa')).toBe(false);
  });
});

describe('countByCategory', () => {
  it('should count products per category and skip the ones without category', () => {
    const products = [
      buildProduct({ id: '1', category: 'Confort' }),
      buildProduct({ id: '2', category: 'Confort' }),
      buildProduct({ id: '3', category: 'Hubs' }),
      buildProduct({ id: '4', category: null }),
    ];

    expect(countByCategory(products)).toEqual({ Confort: 2, Hubs: 1 });
  });
});

const ids = (products: { id: string }[]) => products.map((product) => product.id);

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

describe('selectRelatedProducts', () => {
  const current = buildProduct({ id: 'actual', category: 'Iluminación Inteligente' });
  const catalog = [
    buildProduct({ id: 'seg-1', category: 'Seguridad' }),
    current,
    buildProduct({ id: 'luz-1', category: 'Iluminación Inteligente' }),
    buildProduct({ id: 'luz-oculto', category: 'Iluminación Inteligente', active: false }),
    buildProduct({ id: 'confort-1', category: 'Confort' }),
    buildProduct({ id: 'luz-2', category: 'Iluminación Inteligente' }),
    buildProduct({ id: 'seg-2', category: 'Seguridad' }),
  ];

  it('should start with the same category, then fill with the rest, in catalog order', () => {
    expect(ids(selectRelatedProducts(catalog, current, 4))).toEqual([
      'luz-1',
      'luz-2',
      'seg-1',
      'confort-1',
    ]);
  });

  it('should never include the current product nor inactive ones', () => {
    const related = ids(selectRelatedProducts(catalog, current, 10));

    expect(related).not.toContain('actual');
    expect(related).not.toContain('luz-oculto');
    expect(related).toHaveLength(5);
  });

  it('should fill from other categories when the product has no category', () => {
    const sinCategoria = buildProduct({ id: 'sin-cat', category: null });

    // Sin categoría no hay "misma categoría": va el catálogo en orden.
    expect(ids(selectRelatedProducts([sinCategoria, ...catalog], sinCategoria, 2))).toEqual([
      'seg-1',
      'actual',
    ]);
  });
});
