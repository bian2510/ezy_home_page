// Integration: cada ruta escribe sus propios metadatos en el `<head>`.
//
// Los unit tests prueban el hook y los helpers por separado; esto prueba el
// cableado real — que la página correcta pase los datos correctos. Sin esto,
// un `useDocumentMeta` perfecto puede estar sin llamar en la mitad de las
// páginas y los tests seguirían en verde.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { DEFAULT_SITE_URL } from '@/lib/seo';
import { activeProducts } from '@/data/catalog';

const primerProducto = activeProducts[0];

const canonica = () => document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;

const descripcion = () =>
  document.head.querySelector<HTMLMetaElement>('meta[name="description"]')?.content;

const robots = () => document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content;

const jsonLd = (): Record<string, unknown> | undefined => {
  const script = document.head.querySelector('script[type="application/ld+json"]');
  return script?.textContent === undefined || script.textContent === null
    ? undefined
    : (JSON.parse(script.textContent) as Record<string, unknown>);
};

const montar = (ruta: string) =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  );

describe('metadatos por ruta', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_WHATSAPP_NUMBER', '5491122334455');
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    window.localStorage.clear();
    document.head.innerHTML = '';
    document.title = '';
  });

  it('should brand the landing page and point the canonical at the root', async () => {
    montar('/');

    await waitFor(() => expect(document.title).toBe('EzyHome — Domótica para tu casa'));
    expect(canonica()).toBe(`${DEFAULT_SITE_URL}/`);
    expect(descripcion()).toBeTruthy();
  });

  it('should give the catalog its own title and canonical', async () => {
    montar('/catalogo');

    await waitFor(() => expect(document.title).toContain('Catálogo'));
    expect(document.title).toContain('EzyHome');
    expect(canonica()).toBe(`${DEFAULT_SITE_URL}/catalogo`);
  });

  it('should title a product page with the product name', async () => {
    expect(primerProducto).toBeDefined();
    montar(`/productos/${primerProducto?.id ?? ''}`);

    await waitFor(() => expect(document.title).toBe(`${primerProducto?.name ?? ''} — EzyHome`));
    expect(canonica()).toBe(`${DEFAULT_SITE_URL}/productos/${primerProducto?.id ?? ''}`);
  });

  it('should describe the product as schema.org Product with its price', async () => {
    montar(`/productos/${primerProducto?.id ?? ''}`);

    await waitFor(() => expect(jsonLd()).toBeDefined());
    const datos = jsonLd();

    expect(datos?.['@type']).toBe('Product');
    expect(datos?.name).toBe(primerProducto?.name);
    expect((datos?.offers as { priceCurrency: string }).priceCurrency).toBe('ARS');
  });

  it('should cut the meta description of a long product description down to size', async () => {
    montar(`/productos/${primerProducto?.id ?? ''}`);

    await waitFor(() => expect(descripcion()).toBeTruthy());
    expect((descripcion() ?? '').length).toBeLessThanOrEqual(160);
    expect(descripcion()).not.toContain('\n');
  });

  it('should keep the cart out of the index', async () => {
    montar('/carrito');

    await waitFor(() => expect(document.title).toContain('Carrito'));
    expect(robots()).toBe('noindex, follow');
  });

  it('should keep the 404 out of the index', async () => {
    montar('/una-ruta-que-no-existe');

    await waitFor(() => expect(robots()).toBe('noindex, follow'));
  });

  it('should title the blog list', async () => {
    montar('/blog');

    await waitFor(() => expect(document.title).toContain('Blog'));
    expect(canonica()).toBe(`${DEFAULT_SITE_URL}/blog`);
  });
});
