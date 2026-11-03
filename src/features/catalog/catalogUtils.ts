// Reglas puras del catálogo: búsqueda, conteo por categoría, orden por stock y
// productos relacionados. Sin React.
import type { Availability, Product } from '@/types';

/** Minúsculas y sin tildes: "Cámara" y "camara" tienen que coincidir. */
const normalize = (text: string): string => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * `true` si el producto coincide con la búsqueda: cada palabra tiene que estar
 * en el nombre o la categoría, en cualquier orden. La descripción larga no
 * cuenta: casi todas mencionan WiFi o Alexa y la búsqueda devolvería todo.
 */
export const matchesQuery = (product: Product, query: string): boolean => {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalize(`${product.name} ${product.category ?? ''}`);
  return words.every((word) => haystack.includes(word));
};

/** Cantidad de productos por categoría; los que no tienen categoría no suman. */
export const countByCategory = (products: Product[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const product of products) {
    const category = product.category?.trim();
    if (category === undefined || category === '') continue;
    counts[category] = (counts[category] ?? 0) + 1;
  }
  return counts;
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

/**
 * Otros productos para "Mirá más productos" en el detalle: primero los de la
 * misma categoría y, si no alcanzan, los del resto del catálogo, siempre en el
 * orden de `products.json`. Nunca el producto actual ni uno inactivo. El orden
 * por stock (`outOfStockLast`) se aplica al mostrarlos, cuando responde el ERP.
 */
export const selectRelatedProducts = (
  products: Product[],
  current: Product,
  limit: number,
): Product[] => {
  const others = products.filter((product) => product.active && product.id !== current.id);
  const category = current.category?.trim();
  const sameCategory = (product: Product) =>
    category !== undefined && category !== '' && product.category?.trim() === category;
  return [
    ...others.filter(sameCategory),
    ...others.filter((product) => !sameCategory(product)),
  ].slice(0, limit);
};
