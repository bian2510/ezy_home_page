import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { allProducts } from '@/data/catalog';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import { useCatalog } from './useCatalog';

const CATEGORY_PARAM = 'category';

/**
 * Catalog landing page (route `/catalogo`). Reads the static product dataset
 * from `src/data/products.json`, lets the visitor narrow by category, and
 * renders a responsive grid of `ProductCard`s.
 *
 * Mobile-first: 1 column at 360px, 2 at `sm`, 3 at `md` — see DOMAIN.md
 * › Design Implications and PRD F001 BR-008.
 *
 * El filtro vive también en el query string (`/catalogo?category=…`) para que
 * las tarjetas de categoría del Home lleguen filtradas y el filtro sea
 * compartible.
 */
export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filtered, selectedCategory, setCategory, categories } = useCatalog(
    allProducts,
    searchParams.get(CATEGORY_PARAM),
  );

  const handleSelectCategory = useCallback(
    (category: string | null) => {
      setCategory(category);
      const next = new URLSearchParams(searchParams);
      if (category === null) {
        next.delete(CATEGORY_PARAM);
      } else {
        next.set(CATEGORY_PARAM, category);
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams, setCategory],
  );

  return (
    <section className="mx-auto w-full max-w-content px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold text-foreground sm:text-3xl">Catálogo</h1>

      <div className="mb-6">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground" role="status">
          No hay productos en esta categoría
        </p>
      ) : (
        <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
