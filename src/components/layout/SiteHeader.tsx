import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/features/cart/useCart';

interface NavItem {
  to: string;
  label: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/blog', label: 'Blog' },
  { to: '/quienes-somos', label: 'Quiénes Somos' },
  { to: '/como-comprar', label: 'Cómo Comprar' },
];

export default function SiteHeader() {
  const { itemCount } = useCart();
  const hasItems = itemCount > 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleNavClick(to: string) {
    setMenuOpen(false);
    void navigate(to);
  }

  return (
    <header className="border-b border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="text-lg font-semibold tracking-tight text-sidebar-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          EzyHome
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Principal" className="hidden text-sm sm:block">
          <ul className="flex items-center gap-6">
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
              <CartLink hasItems={hasItems} itemCount={itemCount} />
            </li>
          </ul>
        </nav>

        {/* Mobile: cart + hamburger */}
        <div className="flex items-center gap-2 sm:hidden">
          <CartLink hasItems={hasItems} itemCount={itemCount} />
          <button
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded text-sidebar-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {menuOpen ? (
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Menú móvil"
          className="border-t border-sidebar-border bg-sidebar sm:hidden"
        >
          <ul className="flex flex-col py-2">
            {NAV_ITEMS.map(({ to, label }) => (
              <li key={to}>
                <button
                  onClick={() => handleNavClick(to)}
                  className="w-full px-4 py-3 text-left text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

interface CartLinkProps {
  hasItems: boolean;
  itemCount: number;
}

function CartLink({ hasItems, itemCount }: CartLinkProps) {
  return (
    <Link
      to="/carrito"
      aria-label={
        hasItems ? `Carrito, ${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}` : 'Carrito'
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
  );
}
