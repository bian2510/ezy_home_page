import { useCallback, useMemo, useState } from 'react';
import type { Product } from '@/types';
import { listCategories } from '@/data/catalog';
import { countByCategory, matchesQuery } from './catalogUtils';

/**
 * Catalog state hook. Owns the category filter and derives the visible product
 * list. `selectedCategory === null` represents "all categories" (the Todos
 * chip). Categories are derived from the products array — there is no static
 * category registry, so adding a new category to `products.json` flows through
 * automatically.
 *
 * La búsqueda (`query`, del `?q=` que arma el buscador del header) achica la
 * grilla y los conteos de los chips, pero no los chips: así el visitante ve
 * que la categoría existe aunque su búsqueda no tenga resultados ahí.
 *
 * See PRD F001 BR-001 and acceptance criterion #1.
 */
export interface UseCatalogResult {
  filtered: Product[];
  selectedCategory: string | null;
  setCategory: (category: string | null) => void;
  categories: string[];
  /** Productos por categoría dentro de la búsqueda actual. */
  counts: Record<string, number>;
  /** Productos dentro de la búsqueda actual, de todas las categorías. */
  totalCount: number;
}

/**
 * @param initialCategory Categoría preseleccionada (p. ej. la que llega por
 * `?category=` desde las tarjetas del Home). Se ignora si ningún producto
 * activo la usa, para no dejar el catálogo vacío ante un link viejo.
 * @param query Texto buscado; vacío muestra todo.
 */
export function useCatalog(
  products: Product[],
  initialCategory: string | null = null,
  query = '',
): UseCatalogResult {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(() =>
    initialCategory !== null &&
    products.some((product) => product.active && product.category === initialCategory)
      ? initialCategory
      : null,
  );

  const activeProducts = useMemo(() => products.filter((product) => product.active), [products]);

  const categories = useMemo(() => listCategories(activeProducts), [activeProducts]);

  const searched = useMemo(
    () => activeProducts.filter((product) => matchesQuery(product, query)),
    [activeProducts, query],
  );

  const counts = useMemo(() => countByCategory(searched), [searched]);

  const filtered = useMemo(() => {
    if (selectedCategory === null) return searched;
    return searched.filter((product) => product.category === selectedCategory);
  }, [searched, selectedCategory]);

  const setCategory = useCallback((category: string | null) => {
    setSelectedCategory(category);
  }, []);

  return {
    filtered,
    selectedCategory,
    setCategory,
    categories,
    counts,
    totalCount: searched.length,
  };
}
