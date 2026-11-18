// FeaturedProducts — "Nuestros productos": una selección de productos reales
// (`selectFeaturedProducts`) con los chips de categoría del catálogo para
// filtrarla. Las cards son las del catálogo: precio y stock del ERP y el
// cartel del descuento por transferencia, sin estrellas ni precios tachados.
//
// No es "Más vendidos": todavía no hay datos de ventas (usuario, 2026-11-03).
//
// Los productos sin stock van al final (`outOfStockLast`). El stock llega del
// ERP después del primer render: hasta entonces se ve el orden de la
// selección y, cuando responde, los sin stock bajan al final. La selección y
// los chips no cambian, solo el orden, y las cards miden lo mismo mientras
// cargan, así que la grilla no cambia de alto.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { activeProducts, listCategories } from '@/data/catalog';
import { CategoryFilter, ProductCard, countByCategory, outOfStockLast } from '@/features/catalog';
import { usePricing } from '@/features/pricing';
import Icon from '@/components/ui/Icon';
import SectionHeader from './SectionHeader';
import SectionBand from '@/components/ui/SectionBand';
import { FEATURED_LIMIT, selectFeaturedProducts } from './homeUtils';

const HEADING_ID = 'nuestros-productos-heading';

export default function FeaturedProducts() {
  const featured = useMemo(() => selectFeaturedProducts(activeProducts, FEATURED_LIMIT), []);
  const categories = useMemo(() => listCategories(featured), [featured]);
  const counts = useMemo(() => countByCategory(featured), [featured]);
  const { pricingOf } = usePricing();
  const ordered = useMemo(
    () => outOfStockLast(featured, (product) => pricingOf(product).availability),
    [featured, pricingOf],
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const visible =
    selectedCategory === null
      ? ordered
      : ordered.filter((product) => product.category === selectedCategory);

  if (featured.length === 0) return null;

  return (
    <SectionBand labelledBy={HEADING_ID} tone="surface" className="gap-8 py-16 md:py-24">
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
    </SectionBand>
  );
}
