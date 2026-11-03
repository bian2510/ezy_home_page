// Reglas puras del catálogo: búsqueda y conteo por categoría. Sin React.
import type { Product } from '@/types';

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
