import ProductCard from './ProductCard';
import type { Product } from '@/types';

interface ProductGridProps {
  /** Prefijo del id del heading, para asociar la sección con su título. */
  id: string;
  heading: string;
  products: Product[];
  /** Copy que se muestra cuando la lista viene vacía. */
  emptyMessage: string;
}

/**
 * Sección con título y grilla responsive de productos. Mobile-first: 1 columna
 * a 360px, 2 en `sm`, 3 en `md` (DOMAIN.md › Design Implications).
 */
export default function ProductGrid({ id, heading, products, emptyMessage }: ProductGridProps) {
  const headingId = `${id}-heading`;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <h2 id={headingId} className="text-2xl font-semibold text-foreground sm:text-3xl">
        {heading}
      </h2>
      {products.length === 0 ? (
        <p className="text-muted-foreground" role="status">
          {emptyMessage}
        </p>
      ) : (
        <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 md:grid-cols-3">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
