// Cross-feature shared types. Feature-specific types live under
// `src/features/<feature>/types.ts` to keep the global surface small.

/**
 * Product — dispositivo de domótica disponible para la venta.
 * See DOMAIN.md › Product Core.
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  /** Precio en ARS (pesos argentinos), entero — sin centavos. */
  price: number;
  /** Rutas relativas a las imágenes; la primera es la imagen principal. */
  images: string[];
  /** Categoría de catálogo: 'iluminacion' | 'automatizacion' | 'seguridad'. */
  category: string | null;
  isBestseller: boolean;
  isOnSale: boolean;
  /** Precio original previo al descuento; definido solo cuando `isOnSale === true`. */
  originalPrice?: number;
}

/**
 * CartItem — producto seleccionado por el visitante con su cantidad.
 * Invariante: `quantity` siempre >= 1.
 */
export interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * CartState — estado del carrito persistido en localStorage.
 * See DOMAIN.md › Operational & Regulatory Constraints (Carrito persistente).
 */
export interface CartState {
  items: CartItem[];
}

/**
 * BlogMeta — metadatos de un artículo del blog informativo.
 * El contenido se gestiona como archivos estáticos (v1, sin CMS).
 */
export interface BlogMeta {
  slug: string;
  title: string;
  /** Fecha ISO 8601, formato `YYYY-MM-DD` (ej. "2026-05-24"). */
  date: string;
  image: string | null;
  excerpt?: string;
}

/**
 * Formatea un monto entero de ARS al estilo de moneda local argentino,
 * sin decimales (ej. 12500 -> "$ 12.500").
 *
 * `Intl.NumberFormat('es-AR', { style: 'currency' })` emits a non-breaking
 * space (U+00A0) between symbol and digits. That character is treated as
 * whitespace by Testing Library's default normalizer (`/\s+/g`) but is *not*
 * normalized in the matcher side, which breaks `getByText(formatPrice(x))`
 * round-trips. We post-process to a regular space so DOM text and matcher
 * compare equal after normalization, without changing the visible output.
 */
export const formatPrice = (amount: number): string =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\u00A0/g, ' ');
