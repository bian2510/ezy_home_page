// SiteHeader — header global: logo, buscador, navegación y botón del carrito.
//
// Mobile-first: en el celular el buscador baja a una segunda fila y la
// navegación queda detrás del botón de menú; desde `lg` va todo en una fila.
// El buscador manda a `/catalogo?q=…`, que es donde se filtra.
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CartHeaderButton } from '@/features/cart';
import SearchBox from '@/components/ui/SearchBox';
import Icon from '@/components/ui/Icon';
import { getWhatsAppNumber } from '@/lib/env';

interface NavItem {
  to: string;
  label: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: '/catalogo', label: 'Productos' },
  { to: '/blog', label: 'Blog' },
  { to: '/como-comprar', label: 'Cómo Comprar' },
];

const SEARCH_LABEL = 'Buscar productos';
const SEARCH_PLACEHOLDER = 'Buscar productos (sensores, iluminación, enchufes)…';

const linkClass =
  'inline-flex min-h-11 w-full items-center rounded px-3 py-2 text-label-md font-semibold text-on-primary transition-colors hover:text-primary-fixed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed';

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentQuery =
    location.pathname === '/catalogo' ? (new URLSearchParams(location.search).get('q') ?? '') : '';
  const whatsAppNumber = getWhatsAppNumber();
  const closeMenu = () => setMenuOpen(false);

  const handleSearch = (query: string) => {
    closeMenu();
    void navigate(
      query === '' ? '/catalogo' : `/catalogo?${new URLSearchParams({ q: query }).toString()}`,
    );
  };

  // La `key` remonta el buscador cuando cambia la búsqueda de la URL, así el
  // campo refleja lo que está filtrando el catálogo.
  const search = (className: string) => (
    <SearchBox
      key={currentQuery}
      label={SEARCH_LABEL}
      placeholder={SEARCH_PLACEHOLDER}
      defaultValue={currentQuery}
      onSearch={handleSearch}
      className={className}
    />
  );

  const navLinks = (
    <>
      {NAV_ITEMS.map(({ to, label }) => (
        <li key={to}>
          <Link to={to} onClick={closeMenu} className={linkClass}>
            {label}
          </Link>
        </li>
      ))}
      {/* Sin número configurado el link no lleva a ningún lado: no se muestra. */}
      {whatsAppNumber !== '' && (
        <li>
          <a
            href={`https://wa.me/${whatsAppNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Contactanos
          </a>
        </li>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-header text-on-primary shadow-header">
      <div className="mx-auto flex max-w-content items-center gap-3 px-4 py-3 sm:px-6 lg:gap-6 lg:px-8">
        <Link
          to="/"
          onClick={closeMenu}
          className="shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed"
        >
          <img
            src="/images/logo/logo.png"
            alt="EzyHome"
            width={48}
            height={48}
            className="h-11 w-11 rounded-lg bg-surface-container-lowest object-contain p-0.5 lg:h-12 lg:w-12"
          />
        </Link>

        {search('hidden flex-1 md:block lg:max-w-xl')}

        <nav aria-label="Principal" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-1">{navLinks}</ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <CartHeaderButton />
          <button
            type="button"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-on-primary hover:text-primary-fixed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed lg:hidden"
          >
            <Icon name={menuOpen ? 'close' : 'menu'} className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-3 sm:px-6 md:hidden">{search('block')}</div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Menú móvil"
          className="border-t border-on-primary/20 bg-header lg:hidden"
        >
          <ul className="mx-auto flex max-w-content flex-col px-2 py-2 sm:px-4">{navLinks}</ul>
        </nav>
      )}
    </header>
  );
}
