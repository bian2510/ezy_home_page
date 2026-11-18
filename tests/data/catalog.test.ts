import { describe, expect, it, vi } from 'vitest';
import {
  activeProducts,
  allProducts,
  findActiveProductById,
  findProductBySku,
  listCategories,
} from '@/data/catalog';
import { buildProduct } from '../helpers/builders';

vi.mock('@/data/products.json', () => ({
  default: [
    {
      id: 'activo-1',
      sku: 'FOCO-001',
      name: 'Foco Inteligente',
      description: 'Foco LED Wi-Fi 9W',
      images: ['/images/foco.jpg'],
      category: 'Iluminación Inteligente',
      isBestseller: false,
      active: true,
    },
    {
      id: 'inactivo-1',
      sku: 'CERR-001',
      name: 'Cerradura Sin Stock',
      description: 'Cerradura Zigbee',
      images: ['/images/cerradura.jpg'],
      category: 'Seguridad',
      isBestseller: false,
      active: false,
    },
  ],
}));

describe('catálogo estático', () => {
  it('should expose every product, active or not', () => {
    expect(allProducts).toHaveLength(2);
  });

  it('should expose only the products visible in the storefront', () => {
    expect(activeProducts.map((product) => product.id)).toEqual(['activo-1']);
  });

  it('should find an active product by id', () => {
    expect(findActiveProductById('activo-1')?.name).toBe('Foco Inteligente');
  });

  it('should not find an inactive product by id', () => {
    expect(findActiveProductById('inactivo-1')).toBeUndefined();
  });

  it('should return undefined for an unknown id', () => {
    expect(findActiveProductById('no-existe')).toBeUndefined();
  });
});

describe('findProductBySku', () => {
  it('should find a product by SKU ignoring case and spaces, like the ERP', () => {
    expect(findProductBySku(' foco-001 ')?.id).toBe('activo-1');
  });

  it('should return undefined for an unknown SKU', () => {
    expect(findProductBySku('NO-EXISTE')).toBeUndefined();
  });
});

describe('listCategories', () => {
  it('should list each category once, in order of first appearance', () => {
    const products = [
      buildProduct({ id: '1', category: 'Confort' }),
      buildProduct({ id: '2', category: 'Seguridad' }),
      buildProduct({ id: '3', category: 'Confort' }),
    ];

    expect(listCategories(products)).toEqual(['Confort', 'Seguridad']);
  });

  it('should skip products without a category or with a blank one', () => {
    const products = [
      buildProduct({ id: '1', category: null }),
      buildProduct({ id: '2', category: '  ' }),
      buildProduct({ id: '3', category: 'Hubs' }),
    ];

    expect(listCategories(products)).toEqual(['Hubs']);
  });
});
