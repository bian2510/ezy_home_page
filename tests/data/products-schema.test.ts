// Validación del catálogo real. A diferencia del resto de la suite, este test
// NO mockea `products.json`: corre contra el archivo que se publica.
//
// `products.json` se edita a mano y es la fuente de verdad del negocio; el
// cast `as Product[]` no valida nada en runtime. Un producto activo sin
// categoría ya llegó a producción y rompió el filtro del catálogo.
import { describe, expect, it } from 'vitest';
import productsData from '@/data/products.json';
import { ProductSchema, CatalogSchema, formatIssues } from '@/data/productSchema';
import type { Product } from '@/types';

const buildRaw = (overrides: Record<string, unknown> = {}) => ({
  id: 'p-1',
  name: 'Foco Inteligente',
  description: 'Foco LED Wi-Fi 9W',
  price: 12500,
  images: ['https://http2.mlstatic.com/foco.webp'],
  category: 'Iluminación Inteligente',
  isBestseller: false,
  isOnSale: false,
  active: true,
  ...overrides,
});

describe('products.json — el catálogo publicado', () => {
  it('should satisfy the catalog schema', () => {
    const result = CatalogSchema.safeParse(productsData);

    expect(result.success ? '' : formatIssues(result.error)).toBe('');
  });

  it('should type-check as Product[] once validated', () => {
    const catalog = CatalogSchema.parse(productsData);
    const products: Product[] = catalog;

    expect(products.length).toBeGreaterThan(0);
  });
});

describe('ProductSchema — forma de un producto', () => {
  it('should accept a well-formed product', () => {
    expect(ProductSchema.safeParse(buildRaw()).success).toBe(true);
  });

  it('should reject a price with cents', () => {
    expect(ProductSchema.safeParse(buildRaw({ price: 94685.26 })).success).toBe(false);
  });

  it('should reject a price of zero or less', () => {
    expect(ProductSchema.safeParse(buildRaw({ price: 0 })).success).toBe(false);
    expect(ProductSchema.safeParse(buildRaw({ price: -100 })).success).toBe(false);
  });

  it('should reject a price that is not a number', () => {
    expect(ProductSchema.safeParse(buildRaw({ price: '12500' })).success).toBe(false);
  });

  it('should reject an empty id or name', () => {
    expect(ProductSchema.safeParse(buildRaw({ id: '' })).success).toBe(false);
    expect(ProductSchema.safeParse(buildRaw({ name: '   ' })).success).toBe(false);
  });

  it('should reject a product without images', () => {
    expect(ProductSchema.safeParse(buildRaw({ images: [] })).success).toBe(false);
  });

  it('should reject an image that is neither a URL nor a local path', () => {
    expect(ProductSchema.safeParse(buildRaw({ images: ['foco.webp'] })).success).toBe(false);
  });

  it('should accept a local image path', () => {
    expect(
      ProductSchema.safeParse(buildRaw({ images: ['/products/MLA1/images/01.webp'] })).success,
    ).toBe(true);
  });

  it('should reject an unknown field, to catch typos in field names', () => {
    expect(ProductSchema.safeParse(buildRaw({ pirce: 12500 })).success).toBe(false);
  });
});

describe('ProductSchema — coherencia de promociones', () => {
  it('should reject isOnSale without a promotional price', () => {
    expect(ProductSchema.safeParse(buildRaw({ isOnSale: true })).success).toBe(false);
  });

  it('should reject a promotional price without isOnSale', () => {
    expect(ProductSchema.safeParse(buildRaw({ promotionalPrice: 9000 })).success).toBe(false);
  });

  it('should reject a promotional price that is not below the list price', () => {
    expect(
      ProductSchema.safeParse(buildRaw({ isOnSale: true, promotionalPrice: 12500 })).success,
    ).toBe(false);
    expect(
      ProductSchema.safeParse(buildRaw({ isOnSale: true, promotionalPrice: 13000 })).success,
    ).toBe(false);
  });

  it('should accept a coherent promotion', () => {
    expect(
      ProductSchema.safeParse(buildRaw({ isOnSale: true, promotionalPrice: 9000 })).success,
    ).toBe(true);
  });
});

describe('ProductSchema — categoría', () => {
  it('should reject an active product without a category', () => {
    expect(ProductSchema.safeParse(buildRaw({ active: true, category: null })).success).toBe(false);
    expect(ProductSchema.safeParse(buildRaw({ active: true, category: '  ' })).success).toBe(false);
  });

  it('should accept an inactive product without a category', () => {
    expect(ProductSchema.safeParse(buildRaw({ active: false, category: null })).success).toBe(true);
  });
});

describe('CatalogSchema — reglas del catálogo completo', () => {
  it('should reject duplicated ids', () => {
    const catalog = [buildRaw({ id: 'dup' }), buildRaw({ id: 'dup', name: 'Otro' })];

    expect(CatalogSchema.safeParse(catalog).success).toBe(false);
  });

  it('should reject categories that differ only in case or whitespace', () => {
    const catalog = [
      buildRaw({ id: 'a', category: 'Seguridad' }),
      buildRaw({ id: 'b', category: 'seguridad ' }),
    ];

    expect(CatalogSchema.safeParse(catalog).success).toBe(false);
  });

  it('should accept genuinely different categories', () => {
    const catalog = [
      buildRaw({ id: 'a', category: 'Seguridad' }),
      buildRaw({ id: 'b', category: 'Confort' }),
    ];

    expect(CatalogSchema.safeParse(catalog).success).toBe(true);
  });

  it('should name the offending product in the error message', () => {
    const result = CatalogSchema.safeParse([buildRaw({ id: 'roto', price: 0 })]);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatIssues(result.error)).toContain('roto');
    }
  });
});
