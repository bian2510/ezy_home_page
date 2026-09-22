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
  /** Visibilidad en el storefront — `false` oculta el producto (Home, Catálogo,
   *  Detalle) sin borrarlo del dataset. Útil para productos sin stock. */
  active: boolean;
  /** Precio promocional vigente; definido y usado solo cuando `isOnSale === true`.
   *  Cuando está presente, `price` pasa a mostrarse tachado como precio de lista. */
  promotionalPrice?: number;
  /** Etiqueta de promoción especial (ej. "2x1"). Se muestra como badge en la card y el detalle. */
  promotionBadge?: string;
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

/** Severidad visual de una notificación efímera. */
export type ToastType = 'success' | 'error' | 'info';

/**
 * Toast — notificación efímera. Vive en `types/` porque lo consumen dos capas:
 * el primitivo visual `components/ui/Toast` y la feature `toast`, que no puede
 * importar de la otra dirección (ver `docs/standards/capas-arquitectura.md`).
 */
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

/**
 * Precio efectivo a cobrar/destacar: `promotionalPrice` cuando el producto está
 * en oferta y lo tiene definido; `price` en cualquier otro caso.
 */
export const getEffectivePrice = (product: Product): number =>
  product.isOnSale && product.promotionalPrice !== undefined
    ? product.promotionalPrice
    : product.price;
