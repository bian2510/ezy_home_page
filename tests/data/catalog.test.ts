import { describe, expect, it, vi } from 'vitest';
import { activeProducts, allProducts, findActiveProductById } from '@/data/catalog';

vi.mock('@/data/products.json', () => ({
  default: [
    {
      id: 'activo-1',
      name: 'Foco Inteligente',
      description: 'Foco LED Wi-Fi 9W',
      price: 12500,
      images: ['/images/foco.jpg'],
      category: 'Iluminación Inteligente',
      isBestseller: false,
      isOnSale: false,
      active: true,
    },
    {
      id: 'inactivo-1',
      name: 'Cerradura Sin Stock',
      description: 'Cerradura Zigbee',
      price: 90000,
      images: ['/images/cerradura.jpg'],
      category: 'Seguridad',
      isBestseller: false,
      isOnSale: false,
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
