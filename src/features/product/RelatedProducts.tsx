// RelatedProducts — "Mirá más productos": hasta 4 productos activos, primero
// de la misma categoría (`selectRelatedProducts`), con la card del catálogo.
// Los sin stock van al final cuando responde el ERP, como en el Home.
//
// Grilla simple en vez del carrusel con flechas del mock; en el celular es un
// riel con scroll horizontal propio (la página no se corre de costado).
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { activeProducts } from '@/data/catalog';
import { ProductCard, outOfStockLast, selectRelatedProducts } from '@/features/catalog';
import { usePricing } from '@/features/pricing';
import SectionBand from '@/components/ui/SectionBand';
import Icon from '@/components/ui/Icon';

const RELATED_LIMIT = 4;
const HEADING_ID = 'mas-productos-heading';

interface RelatedProductsProps {
  product: Product;
}

export default function RelatedProducts({ product }: RelatedProductsProps) {
  const { pricingOf } = usePricing();
  const related = useMemo(
    () =>
      outOfStockLast(
        selectRelatedProducts(activeProducts, product, RELATED_LIMIT),
        (item) => pricingOf(item).availability,
      ),
    [product, pricingOf],
  );

  if (related.length === 0) return null;

  return (
    <SectionBand labelledBy={HEADING_ID} tone="low" className="gap-8 py-12 md:py-16">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h2 id={HEADING_ID} className="text-headline-xl-mobile font-extrabold text-on-surface">
          Mirá más productos
        </h2>
        <Link
          to="/catalogo"
          className="inline-flex min-h-11 items-center gap-1 self-start rounded text-label-lg font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:self-auto"
        >
          Ver todo el catálogo
          <Icon name="arrowRight" className="h-4 w-4" />
        </Link>
      </div>

      <ul className="-mx-gutter-mobile flex snap-x list-none gap-4 overflow-x-auto px-gutter-mobile pb-2 sm:-mx-gutter sm:px-gutter md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:p-0 lg:grid-cols-4">
        {related.map((item) => (
          <li key={item.id} className="w-72 shrink-0 snap-start md:w-auto">
            <ProductCard product={item} />
          </li>
        ))}
      </ul>
    </SectionBand>
  );
}
