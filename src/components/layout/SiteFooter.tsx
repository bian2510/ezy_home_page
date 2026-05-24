// SiteFooter — global footer chrome (Task 014).
//
// Hosts the business signature, copyright year, and a small secondary nav so
// visitors can move between Catálogo and Blog without scrolling back to the
// header. The footer renders on every route via `RootLayout`.
//
// Tokens (see `tailwind.config.ts`): only EzyHome tokens (`bg-sidebar`,
// `text-sidebar-foreground`, `border-sidebar-border`, `text-primary`). No
// hex literals; no legacy `bg-brand-*`, `bg-surface`, or `text-text-*`
// tokens.
import { Link } from 'react-router-dom';

interface FooterNavItem {
  to: string;
  label: string;
}

const FOOTER_NAV_ITEMS: ReadonlyArray<FooterNavItem> = [
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/blog', label: 'Blog' },
  { to: '/carrito', label: 'Carrito' },
  { to: '/quienes-somos', label: 'Quiénes Somos' },
  { to: '/como-comprar', label: 'Cómo Comprar' },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="mx-auto flex max-w-content flex-col gap-4 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="font-medium">
          <span className="text-sidebar-foreground">EzyHome</span>
          <span className="ml-2 text-sidebar-foreground/80">
            &copy; {year}. Todos los derechos reservados.
          </span>
        </p>

        <nav aria-label="Pie de página">
          <ul className="flex flex-wrap items-center gap-4">
            {FOOTER_NAV_ITEMS.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="inline-flex min-h-11 items-center text-sidebar-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
