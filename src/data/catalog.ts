// Acceso al catálogo estático. Punto único donde `products.json` se tipa como
// `Product[]`: antes cada página repetía el cast y su propio filtro por
// `active`, así que un cambio de forma en el JSON se detectaba en 4 lugares.
//
// Vive en `data/` —y no en una feature— para que `catalog` y `cart` lo usen
// sin importarse entre sí.
import productsData from './products.json';
import type { Product } from '@/types';

/** Todos los productos del dataset, incluidos los ocultos del storefront. */
export const allProducts = productsData as Product[];

/** Productos visibles en el storefront (`active: true`). */
export const activeProducts: Product[] = allProducts.filter((product) => product.active);

/** Producto vendible por id. `undefined` si no existe o está oculto. */
export const findActiveProductById = (id: string | undefined): Product | undefined =>
  id === undefined ? undefined : activeProducts.find((product) => product.id === id);

/** Producto por id sin filtrar por visibilidad — para reconciliar un carrito viejo. */
export const findProductById = (id: string): Product | undefined =>
  allProducts.find((product) => product.id === id);
