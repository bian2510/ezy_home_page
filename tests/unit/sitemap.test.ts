// Generación del sitemap y del robots.txt. Corre en build time (plugin de
// Vite), no en el browser, así que la lógica vive en `scripts/lib/` y es pura:
// recibe los datos ya leídos y devuelve el texto del archivo.
import { describe, expect, it } from 'vitest';
import {
  RUTAS_ESTATICAS,
  SITIO_POR_DEFECTO,
  construirRobots,
  construirSitemap,
  entradasDeArticulos,
  entradasDeProductos,
} from '../../scripts/lib/sitemap.ts';
import { DEFAULT_SITE_URL } from '../../src/lib/seo';

const productos = [
  { id: 'MLA1', active: true },
  { id: 'MLA2', active: false },
  { id: 'MLA3', active: true },
];

describe('entradasDeProductos', () => {
  it('should only list products visible in the storefront', () => {
    // Un producto oculto por falta de stock devuelve 404 en la web: mandarlo al
    // sitemap es pedirle a Google que indexe una página rota.
    expect(entradasDeProductos(productos).map((entrada) => entrada.ruta)).toEqual([
      '/productos/MLA1',
      '/productos/MLA3',
    ]);
  });

  it('should return nothing for an empty catalog', () => {
    expect(entradasDeProductos([])).toEqual([]);
  });
});

describe('entradasDeArticulos', () => {
  it('should list every post with its date as lastmod', () => {
    const entradas = entradasDeArticulos([
      { slug: 'introduccion-a-la-domotica', date: '2026-05-01' },
    ]);

    expect(entradas).toEqual([{ ruta: '/blog/introduccion-a-la-domotica', lastmod: '2026-05-01' }]);
  });
});

describe('RUTAS_ESTATICAS', () => {
  it('should include the pages worth indexing', () => {
    expect(RUTAS_ESTATICAS).toContain('/');
    expect(RUTAS_ESTATICAS).toContain('/catalogo');
    expect(RUTAS_ESTATICAS).toContain('/blog');
  });

  it('should leave the cart out', () => {
    // El carrito es estado privado del visitante: no hay nada que indexar.
    expect(RUTAS_ESTATICAS).not.toContain('/carrito');
  });
});

describe('construirSitemap', () => {
  const sitio = 'https://ezyhome.com';

  it('should open with the XML declaration and the urlset namespace', () => {
    const xml = construirSitemap(sitio, [{ ruta: '/' }]);

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
  });

  it('should write one absolute loc per entry', () => {
    const xml = construirSitemap(sitio, [{ ruta: '/' }, { ruta: '/catalogo' }]);

    expect(xml).toContain('<loc>https://ezyhome.com/</loc>');
    expect(xml).toContain('<loc>https://ezyhome.com/catalogo</loc>');
    expect(xml.match(/<url>/g)).toHaveLength(2);
  });

  it('should include lastmod only when the entry has one', () => {
    const xml = construirSitemap(sitio, [
      { ruta: '/blog/uno', lastmod: '2026-05-01' },
      { ruta: '/catalogo' },
    ]);

    expect(xml).toContain('<lastmod>2026-05-01</lastmod>');
    expect(xml.match(/<lastmod>/g)).toHaveLength(1);
  });

  it('should escape characters that would break the XML', () => {
    const xml = construirSitemap(sitio, [{ ruta: '/productos/a&b' }]);

    expect(xml).toContain('<loc>https://ezyhome.com/productos/a&amp;b</loc>');
    expect(xml).not.toContain('a&b');
  });

  it('should drop duplicated routes', () => {
    const xml = construirSitemap(sitio, [{ ruta: '/catalogo' }, { ruta: '/catalogo' }]);

    expect(xml.match(/<url>/g)).toHaveLength(1);
  });
});

describe('construirRobots', () => {
  it('should allow everything and point at the sitemap', () => {
    const robots = construirRobots('https://ezyhome.com');

    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain('Sitemap: https://ezyhome.com/sitemap.xml');
  });

  it('should keep the cart out of the crawl', () => {
    expect(construirRobots('https://ezyhome.com')).toContain('Disallow: /carrito');
  });
});

describe('site URL por defecto', () => {
  it('should be the same on the build side and the app side', () => {
    // El sitemap lo escribe el build y las canónicas las escribe la app. Si
    // los dos defaults se separan, Google recibe dos dominios para el mismo
    // sitio y ninguno de los dos gana.
    expect(SITIO_POR_DEFECTO).toBe(DEFAULT_SITE_URL);
  });
});
