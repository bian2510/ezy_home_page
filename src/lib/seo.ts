// Helpers de SEO: título, canónica, recorte de description y JSON-LD.
//
// Todo acá es puro y sin React: decide *qué* texto va en el `<head>`. Quién lo
// escribe es `src/hooks/useDocumentMeta.ts`, y la separación es a propósito —
// esta parte se prueba sin DOM.
//
// Contexto de la decisión: Googlebot ejecuta JavaScript, así que metadatos
// puestos en runtime sí sirven para búsqueda. Los crawlers de WhatsApp e
// Instagram NO ejecutan JS: para los previews al compartir hace falta
// prerender, que es otro trabajo (ver `docs/plans/2026-09-22-seo-organico.md`).

/** Marca, usada como sufijo de todos los títulos. */
export const SITE_NAME = 'EzyHome';

/** Título de la home y fallback de cualquier página sin título propio. */
export const DEFAULT_TITLE = `${SITE_NAME} — Domótica para tu casa`;

/**
 * Dominio público del storefront, sin barra final. Es el que sirve Cloudflare
 * Pages como dominio propio; `ezyhome-storefront.pages.dev` sigue respondiendo,
 * pero es la dirección interna del proyecto, no la que se publica.
 *
 * `ezyhome.app` (sin `shop.`) es otra aplicación del dueño, no este sitio.
 *
 * Se puede sobrescribir con `VITE_SITE_URL`.
 *
 * El mismo valor vive en `scripts/lib/sitemap.ts` para el build, y un test
 * verifica que no se separen: el sitemap y las canónicas tienen que hablar del
 * mismo dominio o Google recibe dos sitios distintos.
 */
export const DEFAULT_SITE_URL = 'https://shop.ezyhome.app';

/** Largo máximo de una meta description antes de que Google la corte. */
const MAX_DESCRIPTION = 160;

/**
 * Título completo del documento: `<página> — EzyHome`.
 * Sin página, o si la página ya es la marca, devuelve el título por defecto.
 */
export const buildTitle = (pageTitle?: string): string => {
  const limpio = (pageTitle ?? '').trim();
  return limpio === '' || limpio === SITE_NAME ? DEFAULT_TITLE : `${limpio} — ${SITE_NAME}`;
};

/**
 * URL canónica absoluta de una ruta.
 *
 * Normaliza para que una sola página no tenga dos URLs: sin query, sin hash y
 * sin barra final (salvo la raíz). Una canónica que varía anula su propio
 * propósito.
 */
export const buildCanonical = (siteUrl: string, path: string): string => {
  const base = siteUrl.replace(/\/+$/, '');
  const soloRuta = path.split('?')[0]?.split('#')[0] ?? '';
  const conBarra = soloRuta.startsWith('/') ? soloRuta : `/${soloRuta}`;
  const normalizada = conBarra === '/' ? '/' : conBarra.replace(/\/+$/, '');
  return `${base}${normalizada}`;
};

/**
 * Deja un texto listo para una meta description: en una sola línea y recortado
 * en el último espacio antes del límite, para no cortar una palabra al medio.
 */
export const truncateForMeta = (text: string, max = MAX_DESCRIPTION): string => {
  const plano = text.replace(/\s+/g, ' ').trim();
  if (plano.length <= max) return plano;

  const recorte = plano.slice(0, max - 1);
  const ultimoEspacio = recorte.lastIndexOf(' ');
  const base = ultimoEspacio > 0 ? recorte.slice(0, ultimoEspacio) : recorte;
  return `${base.replace(/[\s,.;:—-]+$/, '')}…`;
};

/** Datos mínimos de un producto para armar su JSON-LD. */
export interface ProductJsonLdInput {
  id: string;
  name: string;
  description: string;
  /** Rutas de imagen tal como están en el catálogo (relativas al sitio). */
  images: string[];
  /** Precio efectivo en ARS, entero. */
  price: number;
  /** `true` si se puede comprar hoy. */
  available: boolean;
}

/** JSON-LD de schema.org para la ficha de un producto. */
export interface ProductJsonLd {
  '@context': string;
  '@type': 'Product';
  name: string;
  description: string;
  sku: string;
  image?: string[];
  offers: {
    '@type': 'Offer';
    url: string;
    priceCurrency: 'ARS';
    price: string;
    availability: string;
  };
}

const absolutizar = (url: string, ruta: string): string =>
  /^https?:\/\//.test(ruta)
    ? ruta
    : `${new URL(url).origin}${ruta.startsWith('/') ? '' : '/'}${ruta}`;

/**
 * Describe un producto como `schema.org/Product`. Es lo que habilita que el
 * resultado de Google muestre el precio y la disponibilidad, en vez de solo el
 * título y un fragmento de texto.
 */
export const buildProductJsonLd = (
  producto: ProductJsonLdInput,
  canonicalUrl: string,
): ProductJsonLd => {
  const imagenes = producto.images.map((ruta) => absolutizar(canonicalUrl, ruta));

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: producto.name,
    description: truncateForMeta(producto.description, 5000),
    sku: producto.id,
    ...(imagenes.length > 0 ? { image: imagenes } : {}),
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: 'ARS',
      price: String(producto.price),
      availability: producto.available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };
};
