// La categoría del catálogo vive en la URL: un link del footer estando ya en
// /catalogo tiene que filtrar la grilla y marcar el chip, sin recargar.
import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { activeProducts } from '@/data/catalog';

const countIn = (category: string) =>
  activeProducts.filter((product) => product.category === category).length;

describe('filtro del catálogo por URL', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should filter the grid when a footer category is clicked while on /catalogo', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/catalogo']}>
        <App />
      </MemoryRouter>,
    );
    await screen.findByRole('heading', { name: /productos/i, level: 1 });
    expect(screen.getAllByRole('article')).toHaveLength(activeProducts.length);

    const footerCategories = screen.getByRole('navigation', { name: /categorías/i });
    await user.click(within(footerCategories).getByRole('link', { name: 'Seguridad' }));

    expect(screen.getAllByRole('article')).toHaveLength(countIn('Seguridad'));
    const chips = screen.getByRole('group', { name: /filtrar por categoría/i });
    expect(within(chips).getByRole('button', { name: /^Seguridad \(/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(within(footerCategories).getByRole('link', { name: 'Confort' }));

    expect(screen.getAllByRole('article')).toHaveLength(countIn('Confort'));
  });
});
