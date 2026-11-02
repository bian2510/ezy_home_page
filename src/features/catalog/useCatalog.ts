import { useMemo } from 'react';
import type { Product } from '@/types';
import { listCategories } from '@/data/catalog';
import { countByCategory, matchesQuery } from './catalogUtils';

/**
 * Catalog state hook. Derives the visible product list from the category and
 * the search query it receives. `selectedCategory === null` represents "all
 * categories" (the Todos chip). Categories are derived from the products
 * array — there is no static category registry, so adding a new category to
 * `products.json` flows through automatically.
 *
 * No tiene estado propio: la categoría y la búsqueda viven en la URL
 * (`?category=`, `?q=`) y quien llama las pasa. Antes la categoría se copiaba
 * a un estado al montar, y un link del footer estando ya en el catálogo
 * cambiaba la URL sin cambiar la grilla.
 *
 * La búsqueda achica la grilla y los conteos de los chips, pero no los chips:
 * así el visitante ve que la categoría existe aunque su búsqueda no tenga
 * resultados ahí.
 *
 * See PRD F001 BR-001 and acceptance criterion #1.
 */
export interface UseCatalogResult {
  filtered: Product[];
  /** La categoría recibida, o `null` si ningún producto activo la usa. */
  selectedCategory: string | null;
  categories: string[];
  /** Productos por categoría dentro de la búsqueda actual. */
  counts: Record<string, number>;
  /** Productos dentro de la búsqueda actual, de todas las categorías. */
  totalCount: number;
}

/**
 * @param category Categoría elegida (de `?category=`). Se ignora si ningún
 * producto activo la usa, para no dejar el catálogo vacío ante un link viejo.
 * @param query Texto buscado (de `?q=`); vacío muestra todo.
 */
export function useCatalog(
  products: Product[],
  category: string | null = null,
  query = '',
): UseCatalogResult {
  const activeProducts = useMemo(() => products.filter((product) => product.active), [products]);

  const categories = useMemo(() => listCategories(activeProducts), [activeProducts]);

  const selectedCategory = category !== null && categories.includes(category) ? category : null;

  const searched = useMemo(
    () => activeProducts.filter((product) => matchesQuery(product, query)),
    [activeProducts, query],
  );

  const counts = useMemo(() => countByCategory(searched), [searched]);

  const filtered = useMemo(() => {
    if (selectedCategory === null) return searched;
    return searched.filter((product) => product.category === selectedCategory);
  }, [searched, selectedCategory]);

  return { filtered, selectedCategory, categories, counts, totalCount: searched.length };
}
