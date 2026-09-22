// Builders de datos de test compartidos.
//
// `testing.md` § Patrón 1: un `buildX()` local alcanza mientras lo use un solo
// archivo; cuando lo necesitan varios, vive acá. `buildProduct` estaba
// duplicado en 8 archivos de test.
//
// Cada builder devuelve un objeto válido por defecto y acepta `overrides`
// para el único campo que el test esté ejercitando.
import type { BlogMeta, CartItem, Product, Toast } from '@/types';

export const buildProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'p-1',
  name: 'Foco Inteligente',
  description: 'Foco LED Wi-Fi 9W',
  price: 12500,
  images: ['/images/foco.jpg'],
  category: 'Iluminación Inteligente',
  isBestseller: false,
  isOnSale: false,
  active: true,
  ...overrides,
});

export const buildCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  product: buildProduct(),
  quantity: 1,
  ...overrides,
});

export const buildBlogMeta = (overrides: Partial<BlogMeta> = {}): BlogMeta => ({
  slug: 'introduccion-a-la-domotica',
  title: 'Introducción a la domótica',
  date: '2026-05-24',
  image: null,
  ...overrides,
});

export const buildToast = (overrides: Partial<Toast> = {}): Toast => ({
  id: 't-1',
  message: 'Producto agregado al carrito',
  type: 'success',
  ...overrides,
});
