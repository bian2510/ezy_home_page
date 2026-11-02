import { describe, expect, it } from 'vitest';
import { countByCategory, matchesQuery } from '@/features/catalog/catalogUtils';
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
