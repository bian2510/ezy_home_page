// Paginación del catálogo: la página vive en la URL (`?page=N`) junto con la
// categoría y la búsqueda, se resetea al filtrar y nunca deja la grilla vacía.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import App from '@/App';
import { activeProducts } from '@/data/catalog';

const PER_PAGE = 12;
const TOTAL = activeProducts.length;
const LAST_PAGE = Math.ceil(TOTAL / PER_PAGE);
const ON_LAST_PAGE = TOTAL - (LAST_PAGE - 1) * PER_PAGE;

function LocationProbe() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <p data-testid="location">{`${location.pathname}${location.search}`}</p>
      <button type="button" onClick={() => void navigate(-1)}>
        volver
      </button>
    </>
  );
}

const renderAt = async (path: string) => {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <LocationProbe />
    </MemoryRouter>,
  );
  await screen.findByRole('heading', { name: /productos/i, level: 1 });
};

const cards = () => screen.queryAllByRole('article');
const pagination = () => screen.queryByRole('navigation', { name: 'Paginación' });
const location = () => screen.getByTestId('location');

describe('paginación del catálogo', () => {
  const scrollIntoView = vi.fn();

  beforeEach(() => {
    window.localStorage.clear();
    scrollIntoView.mockReset();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show the data set the test relies on', () => {
    // Si el catálogo baja de 13 productos, esta suite deja de probar algo.
    expect(TOTAL).toBeGreaterThan(PER_PAGE);
  });

  it('should show 12 products and the range on the first page', async () => {
    await renderAt('/catalogo');

    expect(cards()).toHaveLength(PER_PAGE);
    expect(screen.getByText(/mostrando/i)).toHaveTextContent(`Mostrando 1–12 de ${TOTAL}`);
    expect(within(pagination()!).getByRole('button', { name: 'Página 1' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('should put the page in the URL, scroll to the grid and survive the back button', async () => {
    const user = userEvent.setup();
    await renderAt('/catalogo');

    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    expect(location()).toHaveTextContent(/^\/catalogo\?page=2$/);
    expect(screen.getByText(/mostrando/i)).toHaveTextContent(`Mostrando 13–24 de ${TOTAL}`);
    expect(scrollIntoView).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'volver' }));

    expect(location()).toHaveTextContent(/^\/catalogo$/);
    expect(screen.getByRole('button', { name: 'Página 1' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('should open straight on the page of the URL, as after a reload', async () => {
    await renderAt(`/catalogo?page=${LAST_PAGE}`);

    expect(cards()).toHaveLength(ON_LAST_PAGE);
  });

  it('should fall back to the last page when the URL page is past the end', async () => {
    await renderAt('/catalogo?page=99');

    expect(cards()).toHaveLength(ON_LAST_PAGE);
    expect(screen.getByRole('button', { name: `Página ${LAST_PAGE}` })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('should fall back to the first page when the URL page is not a number', async () => {
    await renderAt('/catalogo?page=abc');

    expect(cards()).toHaveLength(PER_PAGE);
    expect(screen.getByRole('button', { name: 'Página 1' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('should reset to page 1 when the category changes', async () => {
    const user = userEvent.setup();
    await renderAt('/catalogo?page=2');

    const chips = screen.getByRole('group', { name: /filtrar por categoría/i });
    await user.click(within(chips).getByRole('button', { name: /^Confort \(/ }));

    expect(location()).toHaveTextContent(/^\/catalogo\?category=Confort$/);
  });

  it('should reset to page 1 when searching from the header', async () => {
    const user = userEvent.setup();
    await renderAt('/catalogo?page=2');

    const [searchbox] = screen.getAllByRole('searchbox', { name: /buscar productos/i });
    await user.type(searchbox!, 'sensor{Enter}');

    expect(location()).toHaveTextContent(/^\/catalogo\?q=sensor$/);
  });

  it('should reset to page 1 when the search is cleared', async () => {
    const user = userEvent.setup();
    await renderAt('/catalogo?q=wifi&page=2');

    await user.click(screen.getByRole('button', { name: /ver todos los productos/i }));

    expect(location()).toHaveTextContent(/^\/catalogo$/);
  });

  it('should hide the pagination when everything fits in one page', async () => {
    const category = 'Seguridad';
    const inCategory = activeProducts.filter((p) => p.category === category).length;
    expect(inCategory).toBeLessThanOrEqual(PER_PAGE);

    await renderAt(`/catalogo?category=${category}`);

    expect(cards()).toHaveLength(inCategory);
    expect(pagination()).not.toBeInTheDocument();
  });
});
