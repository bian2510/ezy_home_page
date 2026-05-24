// SiteHeader — global top navigation chrome (Task 014).
//
// Renders the EzyHome logo, the primary nav (Catálogo / Blog / Carrito), and
// a cart indicator with a count badge sourced from `useCart`. The header sits
// on every route via `RootLayout`.
//
// Tokens (see `tailwind.config.ts`): only EzyHome tokens (`bg-sidebar`,
// `text-sidebar-foreground`, `border-sidebar-border`, `bg-destructive`,
// `text-primary`, etc.). No hex literals; no legacy `bg-brand-*`,
// `bg-surface`, or `text-text-*` tokens.
//
// Mobile-first (DOMAIN.md › Design Implications): the layout works at 360px
// without horizontal scroll. The cart badge is hidden when `itemCount === 0`
// so the header never shows a misleading "0" indicator.
import { Link } from 'react-router-dom';
import { useCart } from '@/features/cart/useCart';

interface NavItem {
  to: string;
  label: string;
}

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/blog', label: 'Blog' },
];

export default function SiteHeader() {
  const { itemCount } = useCart();
  const hasItems = itemCount > 0;

  return (
    <header className="border-b border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-sidebar-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          EzyHome
        </Link>

        <nav aria-label="Principal" className="text-sm">
          <ul className="flex items-center gap-3 sm:gap-6">
            {NAV_ITEMS.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="inline-flex min-h-11 items-center px-1 text-sidebar-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/carrito"
                aria-label={
                  hasItems
                    ? `Carrito, ${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}`
                    : 'Carrito'
                }
                className="relative inline-flex min-h-11 min-w-11 items-center justify-center text-sidebar-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span aria-hidden="true">Carrito</span>
                {hasItems && (
                  <span
                    data-testid="cart-badge"
                    aria-hidden="true"
                    className="absolute -right-2 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-semibold leading-none text-primary-foreground"
                  >
                    {itemCount}
                  </span>
                )}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
