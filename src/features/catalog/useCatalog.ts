import { useCallback, useMemo, useState } from 'react';
import type { Product } from '@/types';

/**
 * Catalog state hook. Owns the category filter and derives the visible product
 * list. `selectedCategory === null` represents "all categories" (the Todos
 * chip). Categories are derived from the products array — there is no static
 * category registry, so adding a new category to `products.json` flows through
 * automatically.
 *
 * See PRD F001 BR-001 and acceptance criterion #1.
 */
export interface UseCatalogResult {
  filtered: Product[];
  selectedCategory: string | null;
  setCategory: (category: string | null) => void;
  categories: string[];
}

/**
 * @param initialCategory Categoría preseleccionada (p. ej. la que llega por
 * `?category=` desde las tarjetas del Home). Se ignora si ningún producto
 * activo la usa, para no dejar el catálogo vacío ante un link viejo.
 */
export function useCatalog(
  products: Product[],
  initialCategory: string | null = null,
): UseCatalogResult {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(() =>
    initialCategory !== null &&
    products.some((product) => product.active && product.category === initialCategory)
      ? initialCategory
      : null,
  );

  const activeProducts = useMemo(() => products.filter((product) => product.active), [products]);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    for (const product of activeProducts) {
      const category = product.category?.trim();
      // Un producto sin categoría sigue estando en la grilla, pero no genera
      // un chip — antes producía un filtro con etiqueta vacía.
      if (category === undefined || category === '') continue;
      seen.add(category);
    }
    return Array.from(seen);
  }, [activeProducts]);

  const filtered = useMemo(() => {
    if (selectedCategory === null) return activeProducts;
    return activeProducts.filter((product) => product.category === selectedCategory);
  }, [activeProducts, selectedCategory]);

  const setCategory = useCallback((category: string | null) => {
    setSelectedCategory(category);
  }, []);

  return { filtered, selectedCategory, setCategory, categories };
}
