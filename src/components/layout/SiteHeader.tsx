// SiteHeader — header global: logo, buscador, navegación y botón del carrito.
//
// Mobile-first: una sola fila en todos los anchos (usuario, 2026-11-03): logo,
// buscador (ocupa lo que sobra), carrito y, hasta `lg`, el botón de menú con la
// navegación. En el celular el placeholder es corto; desde `md`, el largo.
// El buscador manda a `/catalogo?q=…`, que es donde se filtra.
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CartHeaderButton } from '@/features/cart';
import SearchBox from '@/components/ui/SearchBox';
import Icon from '@/components/ui/Icon';
import Container from '@/components/ui/Container';
import { cn } from '@/lib/cn';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface NavItem {
  to: string;
  label: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: '/catalogo', label: 'Productos' },
  { to: '/blog', label: 'Blog' },
  { to: '/como-comprar', label: 'Cómo Comprar' },
  // Antes abría WhatsApp directo; ahora lleva a la página con todos los canales.
  { to: '/contacto', label: 'Contactanos' },
];

const SEARCH_LABEL = 'Buscar productos';
const SEARCH_PLACEHOLDER = 'Buscar productos (sensores, iluminación, enchufes)…';
// A 390 px el buscador tiene ~200 px: el largo se cortaba a la mitad. A 320 px
// tiene ~137 px y hasta "Buscar productos" se cortaba. El nombre accesible es
// siempre el `label` ("Buscar productos"), no el placeholder.
const SEARCH_PLACEHOLDER_SHORT = 'Buscar productos';
const SEARCH_PLACEHOLDER_TINY = 'Buscar';
const MD_UP = '(min-width: 768px)';
const PHONE_375_UP = '(min-width: 375px)';

// Foco visible sobre el teal del header: anillo blanco (4.5:1) separado del
// control por 2 px del color del header, así se ve también sobre los botones
// blancos (buscador, carrito).
const headerFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-primary focus-visible:ring-offset-2 focus-visible:ring-offset-header';

// Hover: el texto sigue blanco y se subraya. `primary-fixed` sobre el header
// daba 3.48:1, debajo del mínimo AA.
const linkClass =
  'inline-flex min-h-11 w-full items-center rounded px-3 py-2 text-label-md font-semibold text-on-primary underline-offset-4 hover:underline';

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentQuery =
    location.pathname === '/catalogo' ? (new URLSearchParams(location.search).get('q') ?? '') : '';
  const closeMenu = () => setMenuOpen(false);
  const mdUp = useMediaQuery(MD_UP);
  const phone375Up = useMediaQuery(PHONE_375_UP);
  const placeholder = mdUp
    ? SEARCH_PLACEHOLDER
    : phone375Up
      ? SEARCH_PLACEHOLDER_SHORT
      : SEARCH_PLACEHOLDER_TINY;

  const handleSearch = (query: string) => {
    closeMenu();
    // Desde el catálogo se conservan los demás filtros (la categoría): la URL
    // tiene que repetir lo que se ve. Desde otra página se arranca de cero.
    const params = new URLSearchParams(location.pathname === '/catalogo' ? location.search : '');
    // Otra búsqueda, otra lista: se vuelve a la página 1.
    params.delete('page');
    if (query === '') {
      params.delete('q');
    } else {
      params.set('q', query);
    }
    const search = params.toString();
    void navigate(search === '' ? '/catalogo' : `/catalogo?${search}`);
  };

  // La `key` remonta el buscador cuando cambia la búsqueda de la URL, así el
  // campo refleja lo que está filtrando el catálogo.
  const search = (
    <SearchBox
      key={currentQuery}
      label={SEARCH_LABEL}
      placeholder={placeholder}
      defaultValue={currentQuery}
      onSearch={handleSearch}
      // `min-w-0`: sin esto el campo no se achica y a 320 px empuja el carrito afuera.
      className="min-w-0 flex-1 lg:max-w-xl"
    />
  );

  const navLinks = NAV_ITEMS.map(({ to, label }) => (
    <li key={to}>
      <Link to={to} onClick={closeMenu} className={cn(linkClass, headerFocus)}>
        {label}
      </Link>
    </li>
  ));

  return (
    <header className="sticky top-0 z-50 bg-header text-on-primary shadow-header">
      {/* Huecos chicos en el celular: a 320 px entran logo, buscador, carrito y
          menú con sus 44 px de toque. */}
      <Container className="flex items-center gap-2 py-3 sm:gap-3 lg:gap-6">
        <Link to="/" onClick={closeMenu} className={cn('shrink-0 rounded', headerFocus)}>
          {/* Logo blanco directo sobre el teal del header, sin caja (usuario,
              2026-11-03): blanco sobre `header` da 4.5:1. El ancho y el alto
              siguen la proporción del archivo, así el lugar queda reservado
              antes de que cargue. */}
          <img
            src="/images/logo/logo-white.png"
            alt="EzyHome"
            width={43}
            height={48}
            className="h-11 w-auto lg:h-12"
          />
        </Link>

        {search}

        <nav aria-label="Principal" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-1">{navLinks}</ul>
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <CartHeaderButton />
          <button
            type="button"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className={cn(
              'inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-on-primary hover:bg-on-primary/10 lg:hidden',
              headerFocus,
            )}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} className="h-6 w-6" />
          </button>
        </div>
      </Container>

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Menú móvil"
          className="border-t border-on-primary/20 bg-header lg:hidden"
        >
          <Container>
            <ul className="flex flex-col py-2">{navLinks}</ul>
          </Container>
        </nav>
      )}
    </header>
  );
}
