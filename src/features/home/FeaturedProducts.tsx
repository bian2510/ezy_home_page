// FeaturedProducts — "Nuestros productos": una selección de productos reales
// (`selectFeaturedProducts`) con los chips de categoría del catálogo para
// filtrarla. Las cards son las del catálogo: precio y stock del ERP y el
// cartel del descuento por transferencia, sin estrellas ni precios tachados.
//
// No es "Más vendidos": todavía no hay datos de ventas (usuario, 2026-11-03).
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { activeProducts, listCategories } from '@/data/catalog';
import { CategoryFilter, ProductCard, countByCategory } from '@/features/catalog';
import Icon from '@/components/ui/Icon';
import SectionHeader from './SectionHeader';
import { selectFeaturedProducts } from './homeUtils';

/** Dos filas de 4 en escritorio. */
const FEATURED_LIMIT = 8;
const HEADING_ID = 'nuestros-productos-heading';

export default function FeaturedProducts() {
  const featured = useMemo(() => selectFeaturedProducts(activeProducts, FEATURED_LIMIT), []);
  const categories = useMemo(() => listCategories(featured), [featured]);
  const counts = useMemo(() => countByCategory(featured), [featured]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const visible =
    selectedCategory === null
      ? featured
      : featured.filter((product) => product.category === selectedCategory);

  if (featured.length === 0) return null;

  return (
    <section aria-labelledby={HEADING_ID} className="flex flex-col gap-8">
      <SectionHeader id={HEADING_ID} title="Nuestros productos">
        <Link
          to="/catalogo"
          className="inline-flex min-h-11 items-center gap-1 self-start rounded text-label-lg font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:self-auto"
        >
          Ver todos
          <Icon name="arrowRight" className="h-4 w-4" />
        </Link>
      </SectionHeader>

      {categories.length > 1 && (
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          counts={counts}
          totalCount={featured.length}
        />
      )}

      <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
