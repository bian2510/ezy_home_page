// Integration test: "Nuestros productos" del Home con el precio y stock del
// ERP de verdad (PricingProvider real, `fetch` mockeado).
//
// Los productos sin stock van al final una vez que responde el ERP; mientras
// carga, o si el ERP falla, queda el orden de la selección.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { activeProducts } from '@/data/catalog';
import { selectFeaturedProducts } from '@/features/home/homeUtils';

// Mismo corte que el Home: dos filas de 4.
const featured = selectFeaturedProducts(activeProducts, 8);
const [soldOut] = featured;

const erpResponse = (soldOutSku: string) => ({
  products: activeProducts.map((product) => ({
    sku: product.sku,
    price_mp: 26300,
    price_transfer: 25000,
    stock: product.sku === soldOutSku ? 0 : 5,
    available: product.sku !== soldOutSku,
  })),
});

const renderHome = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );

const featuredNames = () =>
  within(screen.getByRole('heading', { name: /nuestros productos/i }).closest('section')!)
    .getAllByRole('heading', { level: 3 })
    .map((heading) => heading.textContent);

describe('Home — Nuestros productos con el stock del ERP', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_STORE_API_KEY', 'clave-de-prueba');
    vi.stubEnv('VITE_STORE_API_URL', 'http://erp.test');
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('should move a product without stock to the end once the ERP answers', async () => {
    expect(soldOut).toBeDefined();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify(erpResponse(soldOut!.sku)))),
    );

    renderHome();

    // Mientras carga, el orden es el de la selección.
    expect(featuredNames()).toEqual(featured.map((product) => product.name));

    await waitFor(() => expect(featuredNames().at(-1)).toBe(soldOut!.name));
    expect(featuredNames()).toEqual([
      ...featured.slice(1).map((product) => product.name),
      soldOut!.name,
    ]);
  });

  it('should keep the selection order when the ERP fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    renderHome();

    await waitFor(() =>
      expect(screen.getAllByText(/consultar por whatsapp/i).length).toBeGreaterThan(0),
    );
    expect(featuredNames()).toEqual(featured.map((product) => product.name));
  });
});
