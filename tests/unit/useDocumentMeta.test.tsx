// `useDocumentMeta` es lo único del SEO que toca el DOM: título, description,
// canónica y JSON-LD. Todo lo que decide *qué* texto va es puro y se prueba en
// `seo.test.ts`; acá se prueba que quede escrito en el `<head>` y que no se
// acumule al navegar.
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useDocumentMeta } from '../../src/hooks/useDocumentMeta';
import { DEFAULT_SITE_URL } from '../../src/lib/seo';

const contenidoDeMeta = (nombre: string) =>
  document.head.querySelector<HTMLMetaElement>(`meta[name="${nombre}"]`)?.content;

const canonica = () => document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;

const scriptsJsonLd = () => document.head.querySelectorAll('script[type="application/ld+json"]');

afterEach(() => {
  document.head.innerHTML = '';
  document.title = '';
});

describe('useDocumentMeta', () => {
  it('should set a branded document title', () => {
    renderHook(() =>
      useDocumentMeta({ title: 'Catálogo', description: 'Todo', path: '/catalogo' }),
    );

    expect(document.title).toBe('Catálogo — EzyHome');
  });

  it('should write the meta description', () => {
    renderHook(() =>
      useDocumentMeta({
        title: 'Catálogo',
        description: 'Sensores, cerraduras y luces inteligentes.',
        path: '/catalogo',
      }),
    );

    expect(contenidoDeMeta('description')).toBe('Sensores, cerraduras y luces inteligentes.');
  });

  it('should reuse the meta tag that index.html already ships', () => {
    // Si creáramos una segunda, el crawler ve dos descriptions y elige una.
    const existente = document.createElement('meta');
    existente.name = 'description';
    existente.content = 'la de index.html';
    document.head.appendChild(existente);

    renderHook(() => useDocumentMeta({ title: 'Blog', description: 'Notas', path: '/blog' }));

    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(contenidoDeMeta('description')).toBe('Notas');
  });

  it('should write an absolute canonical URL', () => {
    renderHook(() => useDocumentMeta({ title: 'Blog', description: 'Notas', path: '/blog' }));

    expect(canonica()).toBe(`${DEFAULT_SITE_URL}/blog`);
  });

  it('should keep a single canonical link when the route changes', () => {
    const { rerender } = renderHook(
      (props: { path: string }) =>
        useDocumentMeta({ title: 'X', description: 'Y', path: props.path }),
      { initialProps: { path: '/' } },
    );

    rerender({ path: '/catalogo' });

    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(canonica()).toBe(`${DEFAULT_SITE_URL}/catalogo`);
  });

  it('should not inject JSON-LD when the page has none', () => {
    renderHook(() => useDocumentMeta({ title: 'Blog', description: 'Notas', path: '/blog' }));

    expect(scriptsJsonLd()).toHaveLength(0);
  });

  it('should inject the JSON-LD the page provides', () => {
    renderHook(() =>
      useDocumentMeta({
        title: 'Plafón',
        description: 'Luz',
        path: '/productos/MLA1',
        jsonLd: { '@type': 'Product', name: 'Plafón' },
      }),
    );

    const scripts = scriptsJsonLd();
    expect(scripts).toHaveLength(1);
    expect(JSON.parse(scripts[0]?.textContent ?? '{}')).toEqual({
      '@type': 'Product',
      name: 'Plafón',
    });
  });

  it('should remove the JSON-LD when leaving the page', () => {
    // Sin esto, el producto que el visitante miró antes sigue declarado en el
    // `<head>` del carrito.
    const { unmount } = renderHook(() =>
      useDocumentMeta({
        title: 'Plafón',
        description: 'Luz',
        path: '/productos/MLA1',
        jsonLd: { '@type': 'Product' },
      }),
    );

    unmount();

    expect(scriptsJsonLd()).toHaveLength(0);
  });

  it('should not ask for noindex by default', () => {
    renderHook(() => useDocumentMeta({ title: 'Blog', description: 'Notas', path: '/blog' }));

    expect(contenidoDeMeta('robots')).toBeUndefined();
  });

  it('should mark a page as noindex when asked', () => {
    // El carrito y el 404 no aportan nada a una búsqueda y diluyen el resto.
    renderHook(() =>
      useDocumentMeta({
        title: 'Carrito',
        description: 'Tu carrito',
        path: '/carrito',
        noIndex: true,
      }),
    );

    expect(contenidoDeMeta('robots')).toBe('noindex, follow');
  });

  it('should drop the noindex when moving to an indexable page', () => {
    const { rerender } = renderHook(
      (props: { noIndex: boolean }) =>
        useDocumentMeta({
          title: 'X',
          description: 'Y',
          path: '/x',
          ...(props.noIndex ? { noIndex: true } : {}),
        }),
      { initialProps: { noIndex: true } },
    );

    rerender({ noIndex: false });

    expect(contenidoDeMeta('robots')).toBeUndefined();
  });

  it('should replace the JSON-LD instead of stacking it', () => {
    const { rerender } = renderHook(
      (props: { name: string }) =>
        useDocumentMeta({
          title: props.name,
          description: 'Luz',
          path: `/productos/${props.name}`,
          jsonLd: { '@type': 'Product', name: props.name },
        }),
      { initialProps: { name: 'A' } },
    );

    rerender({ name: 'B' });

    const scripts = scriptsJsonLd();
    expect(scripts).toHaveLength(1);
    expect(scripts[0]?.textContent).toContain('"B"');
  });
});
