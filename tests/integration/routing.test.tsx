// Integración del router: las rutas se cargan por demanda (`lazy`) y una
// excepción de render queda contenida en el `<main>`, sin llevarse el chrome.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

describe('rutas cargadas por demanda', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('should render the landing without waiting for a chunk', () => {
    renderAt('/');

    expect(screen.getByRole('heading', { name: /domótica para tu hogar/i })).toBeInTheDocument();
  });

  it('should load the catalog route on demand', async () => {
    renderAt('/catalogo');

    expect(await screen.findByRole('heading', { name: /catálogo/i, level: 1 })).toBeInTheDocument();
  });

  it('should load the cart route on demand', async () => {
    renderAt('/carrito');

    expect(await screen.findByRole('heading', { name: /mi carrito/i })).toBeInTheDocument();
  });

  it('should load the blog route on demand', async () => {
    renderAt('/blog');

    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should keep the header and footer visible while a route chunk loads', () => {
    renderAt('/catalogo');

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('should announce the loading state to assistive tech', () => {
    renderAt('/quienes-somos');

    // Antes de que resuelva el chunk, el fallback de Suspense es lo único en
    // el <main>; después lo reemplaza la página.
    expect(screen.getByRole('status')).toHaveAccessibleName(/cargando/i);
  });
});

describe('errores de render contenidos', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('should show the fallback inside the layout when a page throws', async () => {
    // Un catálogo corrupto es el modo de falla realista: el JSON es editado a
    // mano y `products.json` se lee en el módulo de la página.
    vi.doMock('@/data/catalog', () => ({
      get allProducts(): never {
        throw new Error('catálogo corrupto');
      },
      get activeProducts(): never {
        throw new Error('catálogo corrupto');
      },
      findActiveProductById: () => undefined,
      findProductById: () => undefined,
    }));

    vi.resetModules();
    const { default: FreshApp } = await import('@/App');

    render(
      <MemoryRouter initialEntries={['/catalogo']}>
        <FreshApp />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(/algo salió mal/i);
    // El chrome sigue en pie: el visitante puede navegar a otra sección.
    expect(screen.getByRole('banner')).toBeInTheDocument();

    vi.doUnmock('@/data/catalog');
  });
});
