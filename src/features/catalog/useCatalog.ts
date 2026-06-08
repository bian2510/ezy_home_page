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

export function useCatalog(products: Product[]): UseCatalogResult {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const activeProducts = useMemo(() => products.filter((product) => product.active), [products]);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    for (const product of activeProducts) {
      seen.add(product.category ?? '');
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
