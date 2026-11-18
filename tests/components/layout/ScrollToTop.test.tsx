import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import ScrollToTop from '@/components/layout/ScrollToTop';

function Nav() {
  const navigate = useNavigate();
  return (
    <>
      <button type="button" onClick={() => void navigate('/productos/b')}>
        otro producto
      </button>
      <button type="button" onClick={() => void navigate('/catalogo?page=2')}>
        catálogo página 2
      </button>
      <button type="button" onClick={() => void navigate('/catalogo?page=3')}>
        catálogo página 3
      </button>
      <button type="button" onClick={() => void navigate('#detalle')}>
        ancla
      </button>
      <button type="button" onClick={() => void navigate(-1)}>
        atrás
      </button>
    </>
  );
}

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <ScrollToTop />
      <Nav />
    </MemoryRouter>,
  );

describe('ScrollToTop', () => {
  const scrollTo = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('scrollTo', scrollTo);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    scrollTo.mockClear();
  });

  it('should not scroll on the first render: the browser decides on load', () => {
    renderAt('/productos/a');

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('should scroll to the top when going to another page', async () => {
    const user = userEvent.setup();
    renderAt('/productos/a');

    await user.click(screen.getByRole('button', { name: 'otro producto' }));

    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('should leave the scroll alone when only the query or the hash changes', async () => {
    const user = userEvent.setup();
    renderAt('/catalogo');

    await user.click(screen.getByRole('button', { name: 'catálogo página 2' }));
    await user.click(screen.getByRole('button', { name: 'catálogo página 3' }));
    await user.click(screen.getByRole('button', { name: 'ancla' }));

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('should not scroll on back/forward: the browser restores the position', async () => {
    const user = userEvent.setup();
    renderAt('/productos/a');
    await user.click(screen.getByRole('button', { name: 'otro producto' }));
    scrollTo.mockClear();

    await user.click(screen.getByRole('button', { name: 'atrás' }));

    expect(scrollTo).not.toHaveBeenCalled();
  });
});
