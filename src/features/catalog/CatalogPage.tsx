import { useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/ui/PageHeader';
import { allProducts } from '@/data/catalog';
import Pagination from '@/components/ui/Pagination';
import { paginate, parsePage } from '@/lib/pagination';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import SearchNotice from './SearchNotice';
import TrustStrip from './TrustStrip';
import { useCatalog } from './useCatalog';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

const CATEGORY_PARAM = 'category';
const QUERY_PARAM = 'q';
const PAGE_PARAM = 'page';
/** 4 filas de 3 en escritorio. */
const PRODUCTS_PER_PAGE = 12;

/**
 * Catalog landing page (route `/catalogo`). Reads the static product dataset
 * from `src/data/products.json`, lets the visitor narrow by category and by
 * the header search, and renders a responsive grid of `ProductCard`s.
 *
 * Mobile-first: 1 column at 360px, 2 at `sm`, 3 at `lg` — see DOMAIN.md
 * › Design Implications and PRD F001 BR-008.
 *
 * El filtro, la búsqueda y la página viven en el query string
 * (`/catalogo?category=…`, `?q=…`, `?page=…`) para que las tarjetas del Home y el buscador del header lleguen
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
  const { filtered, selectedCategory, categories, counts, totalCount } = useCatalog(
    allProducts,
    searchParams.get(CATEGORY_PARAM),
    query,
  );
  // Una página inválida o fuera de rango se muestra como la válida más
  // cercana: la grilla nunca queda vacía por un `?page=` viejo.
  const { page, totalPages, start, end } = paginate(
    filtered.length,
    parsePage(searchParams.get(PAGE_PARAM)),
    PRODUCTS_PER_PAGE,
  );
  const gridRef = useRef<HTMLDivElement>(null);

  // La URL es la única fuente de verdad del filtro: el chip solo la cambia.
  const handleSelectCategory = useCallback(
    (category: string | null) => {
      const next = new URLSearchParams(searchParams);
      // Otro filtro, otra lista: se vuelve a la página 1.
      next.delete(PAGE_PARAM);
      if (category === null) {
        next.delete(CATEGORY_PARAM);
      } else {
        next.set(CATEGORY_PARAM, category);
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const handleClearSearch = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete(QUERY_PARAM);
    next.delete(PAGE_PARAM);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  // Cambiar de página suma una entrada al historial (sin `replace`): el botón
  // "atrás" vuelve a la página anterior. Después sube al principio de la grilla.
  const handlePageChange = useCallback(
    (target: number) => {
      const next = new URLSearchParams(searchParams);
      if (target === 1) {
        next.delete(PAGE_PARAM);
      } else {
        next.set(PAGE_PARAM, String(target));
      }
      setSearchParams(next);
      gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [searchParams, setSearchParams],
  );

  const emptyMessage =
    query === ''
      ? 'No hay productos en esta categoría'
      : 'No encontramos productos para tu búsqueda';

  return (
    <>
      <PageHeader id="catalogo-heading" breadcrumb={[{ label: 'Productos' }]} title="Productos">
        Encontrá las mejores soluciones en domótica e iluminación inteligente para transformar tu
        hogar.
      </PageHeader>

      <Container className="flex flex-col gap-6 py-8">
        <div className="flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            counts={counts}
            totalCount={totalCount}
          />
          <p className="shrink-0 px-1 text-body-sm font-medium text-secondary">
            {filtered.length === 0 ? (
              'Mostrando 0 productos'
            ) : (
              <>
                Mostrando{' '}
                <strong className="font-bold text-on-surface">
                  {start + 1}–{end}
                </strong>{' '}
                de <strong className="font-bold text-on-surface">{filtered.length}</strong>
              </>
            )}
          </p>
        </div>

        {query !== '' && <SearchNotice query={query} onClear={handleClearSearch} />}

        {filtered.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground" role="status">
            {emptyMessage}
          </p>
        ) : (
          // `scroll-mt-28`: al subir a la grilla, el header sticky no la tapa.
          <div ref={gridRef} className="flex scroll-mt-28 flex-col gap-8">
            <ul className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2 lg:grid-cols-3">
              {filtered.slice(start, end).map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}

        <TrustStrip />
      </Container>
    </>
  );
}
