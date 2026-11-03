// ProductBreadcrumb — Inicio / Catálogo / categoría / producto, en la franja
// clara de arriba del detalle (como el mock).
import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';

interface ProductBreadcrumbProps {
  product: Product;
}

const linkClass =
  'inline-flex min-h-11 items-center gap-1 rounded transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:min-h-0';

function Separator() {
  return (
    <li aria-hidden="true" className="text-outline">
      /
    </li>
  );
}

export default function ProductBreadcrumb({ product }: ProductBreadcrumbProps) {
  const category = product.category?.trim();

  return (
    <div className="w-full bg-surface-container-low">
      <Container className="py-2">
        <nav aria-label="Ruta de navegación">
          <ol className="flex flex-wrap items-center gap-x-2 text-body-sm text-on-surface-variant">
            <li>
              <Link to="/" className={linkClass}>
                <Icon name="home" className="h-4 w-4" />
                Inicio
              </Link>
            </li>
            <Separator />
            <li>
              <Link to="/catalogo" className={linkClass}>
                Catálogo
              </Link>
            </li>
            {category !== undefined && category !== '' && (
              <>
                <Separator />
                <li>
                  <Link
                    to={`/catalogo?category=${encodeURIComponent(category)}`}
                    className={linkClass}
                  >
                    {category}
                  </Link>
                </li>
              </>
            )}
            <Separator />
            <li
              aria-current="page"
              className="min-w-0 max-w-xs truncate font-semibold text-on-surface md:max-w-md"
            >
              {product.name}
            </li>
          </ol>
        </nav>
      </Container>
    </div>
  );
}
