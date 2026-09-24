// Generación del `sitemap.xml` y del `robots.txt`.
//
// Corre en build time, desde el plugin de Vite (`scripts/vite-plugin-seo.ts`),
// no en el browser. Acá solo hay funciones puras: reciben los datos ya leídos
// y devuelven el texto del archivo, así se prueban sin tocar el disco.
//
// Por qué generarlo y no mantenerlo a mano: el catálogo cambia todos los meses
// con `pnpm precios:aplicar`, y un sitemap escrito a mano queda viejo en el
// primer cambio de stock. Un sitemap que lista páginas que ya devuelven 404 es
// peor que no tener sitemap.

/**
 * Dominio por defecto. Debe coincidir con `DEFAULT_SITE_URL` de
 * `src/lib/seo.ts`, y hay un test que lo verifica: el sitemap lo escribe el
 * build y las canónicas las escribe la app; si se separan, Google recibe dos
 * dominios para el mismo sitio.
 */
export const SITIO_POR_DEFECTO = 'https://ezyhome-storefront.pages.dev';

/**
 * Rutas fijas que vale la pena indexar.
 *
 * `/carrito` queda afuera —es estado privado del visitante, no hay contenido—
 * y el 404 tampoco entra, por razones obvias.
 */
export const RUTAS_ESTATICAS = [
  '/',
  '/catalogo',
  '/blog',
  '/quienes-somos',
  '/como-comprar',
] as const;

export interface EntradaSitemap {
  ruta: string;
  /** Fecha ISO `YYYY-MM-DD`. Se omite cuando no hay una fecha honesta. */
  lastmod?: string;
}

/** Lo mínimo que el sitemap necesita saber de un producto. */
export interface ProductoIndexable {
  id: string;
  active: boolean;
}

/** Lo mínimo que el sitemap necesita saber de un artículo. */
export interface ArticuloIndexable {
  slug: string;
  date: string;
}

/**
 * Una entrada por producto visible. Los ocultos por falta de stock devuelven
 * 404 en la web: mandarlos al sitemap es pedirle a Google que indexe una
 * página rota.
 */
export const entradasDeProductos = (productos: ProductoIndexable[]): EntradaSitemap[] =>
  productos
    .filter((producto) => producto.active)
    .map((producto) => ({ ruta: `/productos/${producto.id}` }));

/** Una entrada por artículo, con su fecha de publicación como `lastmod`. */
export const entradasDeArticulos = (articulos: ArticuloIndexable[]): EntradaSitemap[] =>
  articulos.map((articulo) => ({
    ruta: `/blog/${articulo.slug}`,
    lastmod: articulo.date,
  }));

const escaparXml = (texto: string): string =>
  texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/** XML del sitemap, con una `<url>` por entrada y sin rutas repetidas. */
export const construirSitemap = (sitio: string, entradas: EntradaSitemap[]): string => {
  const base = sitio.replace(/\/+$/, '');
  const vistas = new Set<string>();

  const urls = entradas
    .filter((entrada) => {
      if (vistas.has(entrada.ruta)) return false;
      vistas.add(entrada.ruta);
      return true;
    })
    .map((entrada) => {
      const loc = escaparXml(`${base}${entrada.ruta}`);
      const lastmod =
        entrada.lastmod === undefined ? '' : `\n    <lastmod>${entrada.lastmod}</lastmod>`;
      return `  <url>\n    <loc>${loc}</loc>${lastmod}\n  </url>`;
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
};

/** `robots.txt` apuntando al sitemap. Sin esto, hay que esperar a que Google lo descubra solo. */
export const construirRobots = (sitio: string): string => {
  const base = sitio.replace(/\/+$/, '');
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /carrito',
    '',
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ].join('\n');
};
