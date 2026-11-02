// SiteFooter — footer global: la marca, la navegación secundaria, las
// categorías del catálogo y el contacto.
//
// Solo datos reales: las categorías salen de los productos visibles y el
// contacto es el WhatsApp configurado (`VITE_WHATSAPP_NUMBER`). Sin número, no
// se muestra un link que no lleva a ningún lado.
import { Link } from 'react-router-dom';
import { activeProducts, listCategories } from '@/data/catalog';
import Icon from '@/components/ui/Icon';
import { getWhatsAppNumber } from '@/lib/env';
import { cn } from '@/lib/cn';

interface FooterNavItem {
  to: string;
  label: string;
}

const FOOTER_NAV_ITEMS: readonly FooterNavItem[] = [
  { to: '/catalogo', label: 'Productos' },
  { to: '/blog', label: 'Blog' },
  { to: '/quienes-somos', label: 'Quiénes Somos' },
  { to: '/como-comprar', label: 'Cómo Comprar' },
  { to: '/carrito', label: 'Carrito' },
];

/**
 * Categorías de los productos visibles. El footer está afuera del
 * `ErrorBoundary` de la página: si el catálogo no se puede leer, el footer
 * queda sin esa columna en vez de tirar abajo el sitio entero.
 */
const footerCategories = (): string[] => {
  try {
    return listCategories(activeProducts);
  } catch {
    return [];
  }
};

const headingClass = 'text-sm font-bold uppercase tracking-wider text-inverse-foreground';
const linkClass =
  'inline-flex min-h-11 items-center text-sm text-inverse-muted transition hover:text-inverse-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-primary sm:min-h-9';

export default function SiteFooter() {
  const year = new Date().getFullYear();
  const whatsAppNumber = getWhatsAppNumber();
  const categories = footerCategories();

  return (
    <footer className="mt-12 bg-inverse text-inverse-foreground">
      <div className="mx-auto grid max-w-content grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
          <p className="flex items-center gap-2 text-headline-sm font-extrabold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
              <Icon name="home" />
            </span>
            EzyHome
          </p>
          <p className="text-sm text-inverse-muted">
            Hacemos que la domótica sea accesible para todos: tecnología simple para vivir de forma
            más cómoda, segura y eficiente.
          </p>
        </div>

        <nav aria-label="Pie de página" className="flex flex-col gap-2">
          <h2 className={headingClass}>Sitio</h2>
          <ul>
            {FOOTER_NAV_ITEMS.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className={linkClass}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {categories.length > 0 && (
          <nav aria-label="Categorías" className="flex flex-col gap-2">
            <h2 className={headingClass}>Categorías</h2>
            <ul>
              {categories.map((category) => (
                <li key={category}>
                  <Link
                    to={`/catalogo?category=${encodeURIComponent(category)}`}
                    className={linkClass}
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="flex flex-col gap-2">
          <h2 className={headingClass}>Contacto</h2>
          {whatsAppNumber !== '' && (
            <a
              href={`https://wa.me/${whatsAppNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(linkClass, 'gap-2')}
            >
              <Icon name="chat" className="text-inverse-primary" />
              Escribinos por WhatsApp
            </a>
          )}
          <p className="flex items-center gap-2 text-sm text-inverse-muted">
            <Icon name="store" className="text-inverse-primary" />
            Retiro en el local
          </p>
        </div>
      </div>

      <div className="border-t border-inverse-border">
        <p className="mx-auto max-w-content px-4 py-5 text-xs text-inverse-muted sm:px-6 lg:px-8">
          &copy; {year} EzyHome. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
