// Reglas puras del Home: qué productos se muestran en "Nuestros productos" y
// qué tarjetas de categoría hay. Sin React.
import type { Availability, Product } from '@/types';
import { listCategories } from '@/data/catalog';
import { countByCategory } from '@/features/catalog';

/** Clave de agrupación de un producto sin categoría. */
const NO_CATEGORY = '';

const categoryOf = (product: Product): string => product.category?.trim() ?? NO_CATEGORY;

/**
 * Selección de "Nuestros productos". Todavía no hay datos de ventas, así que
 * no es un ranking: son los productos marcados con `isBestseller` en
 * `products.json` (la lista curada de destacados) y, si no hay ninguno
 * marcado, los primeros activos.
 *
 * Se alternan las categorías en el orden en que aparecen en el catálogo (uno
 * de cada una, después el segundo de cada una…) para que el corte de `limit`
 * no deje todo en una sola categoría y los chips tengan algo para filtrar.
 * Siempre el mismo resultado para el mismo catálogo.
 */
export const selectFeaturedProducts = (products: Product[], limit: number): Product[] => {
  const active = products.filter((product) => product.active);
  const flagged = active.filter((product) => product.isBestseller);
  const pool = flagged.length > 0 ? flagged : active;

  const groups = new Map<string, Product[]>();
  for (const product of pool) {
    const key = categoryOf(product);
    groups.set(key, [...(groups.get(key) ?? []), product]);
  }

  const queues = Array.from(groups.values());
  const selected: Product[] = [];
  for (let round = 0; selected.length < limit; round += 1) {
    const picked = queues.flatMap((queue) => queue[round] ?? []);
    if (picked.length === 0) break;
    selected.push(...picked.slice(0, limit - selected.length));
  }
  return selected;
};

/**
 * Los productos sin stock al final, sin cambiar el orden de cada grupo
 * (usuario, 2026-11-03). Solo cuenta "sin stock" del ERP: mientras carga
 * (`loading`) o si el ERP falló (`no_price`, "Consultar precio") no se sabe
 * si hay stock, y el orden queda como está.
 */
export const outOfStockLast = (
  products: Product[],
  availabilityOf: (product: Product) => Availability,
): Product[] => {
  const soldOut = (product: Product) => availabilityOf(product) === 'out_of_stock';
  return [...products.filter((product) => !soldOut(product)), ...products.filter(soldOut)];
};

/** Tarjeta de categoría del Home. */
export interface CategoryCard {
  category: string;
  /** Productos activos de la categoría. */
  count: number;
  /** Catálogo filtrado por la categoría. */
  href: string;
  /** Bajada de la tarjeta; `undefined` si la categoría todavía no tiene una. */
  description: string | undefined;
}

/**
 * Una tarjeta por cada categoría del catálogo activo, en el orden del
 * catálogo, con su cantidad real de productos y el link al catálogo filtrado.
 */
export const buildCategoryCards = (
  products: Product[],
  descriptions: Readonly<Record<string, string>>,
): CategoryCard[] => {
  const active = products.filter((product) => product.active);
  const counts = countByCategory(active);
  return listCategories(active).map((category) => ({
    category,
    count: counts[category] ?? 0,
    href: `/catalogo?category=${encodeURIComponent(category)}`,
    description: descriptions[category],
  }));
};

/** "Ver 1 producto" / "Ver N productos". */
export const productCountLabel = (count: number): string =>
  `Ver ${count} ${count === 1 ? 'producto' : 'productos'}`;
