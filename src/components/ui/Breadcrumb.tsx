// Breadcrumb — "Inicio / … / página actual", la ruta de navegación de arriba de
// las páginas de los mocks (Cómo comprar, el blog). Siempre arranca en Inicio;
// el último paso es la página actual y no es un link.
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/Icon';

export interface BreadcrumbItem {
  label: string;
  /** Ruta del paso; sin `to` es la página actual. */
  to?: string;
}

interface BreadcrumbProps {
  /** Los pasos después de Inicio, el último es la página actual. */
  items: readonly BreadcrumbItem[];
  className?: string;
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

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Ruta de navegación" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 text-body-sm text-on-surface-variant">
        <li>
          <Link to="/" className={linkClass}>
            <Icon name="home" className="h-4 w-4" />
            Inicio
          </Link>
        </li>
        {items.map(({ label, to }) => (
          <Fragment key={label}>
            <Separator />
            {to === undefined ? (
              <li
                aria-current="page"
                className="min-w-0 max-w-xs truncate font-semibold text-primary md:max-w-md"
              >
                {label}
              </li>
            ) : (
              <li>
                <Link to={to} className={linkClass}>
                  {label}
                </Link>
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
