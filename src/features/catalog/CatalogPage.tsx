import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { allProducts } from '@/data/catalog';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import CatalogHeading from './CatalogHeading';
import SearchNotice from './SearchNotice';
import TrustStrip from './TrustStrip';
import { useCatalog } from './useCatalog';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

const CATEGORY_PARAM = 'category';
const QUERY_PARAM = 'q';

/**
 * Catalog landing page (route `/catalogo`). Reads the static product dataset
 * from `src/data/products.json`, lets the visitor narrow by category and by
 * the header search, and renders a responsive grid of `ProductCard`s.
 *
 * Mobile-first: 1 column at 360px, 2 at `sm`, 3 at `lg` — see DOMAIN.md
 * › Design Implications and PRD F001 BR-008.
 *
 * El filtro y la búsqueda viven en el query string (`/catalogo?category=…`,
 * `?q=…`) para que las tarjetas del Home y el buscador del header lleguen
 * filtrados y el filtro sea compartible.
 */
export default function CatalogPage() {
  useDocumentMeta({
    title: 'Catálogo',
    description:
      'Todo el catálogo de EzyHome: iluminación inteligente, seguridad, confort, protección y alertas, y hubs para tu hogar.',
    path: '/catalogo',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get(QUERY_PARAM)?.trim() ?? '';
  const { filtered, selectedCategory, setCategory, categories, counts, totalCount } = useCatalog(
    allProducts,
    searchParams.get(CATEGORY_PARAM),
    query,
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

  const handleClearSearch = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete(QUERY_PARAM);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const emptyMessage =
    query === ''
      ? 'No hay productos en esta categoría'
      : 'No encontramos productos para tu búsqueda';

  return (
    <section className="flex w-full flex-col gap-6">
      <CatalogHeading />

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          counts={counts}
          totalCount={totalCount}
        />
        <p className="shrink-0 px-1 text-xs font-medium text-muted-foreground">
          Mostrando <strong className="font-bold text-foreground">{filtered.length}</strong>{' '}
          {filtered.length === 1 ? 'producto' : 'productos'}
        </p>
      </div>

      {query !== '' && <SearchNotice query={query} onClear={handleClearSearch} />}

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground" role="status">
          {emptyMessage}
        </p>
      ) : (
        <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {filtered.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}

      <TrustStrip />
    </section>
  );
}
