// Cross-feature shared types. Feature-specific types live under
// `src/features/<feature>/types.ts` to keep the global surface small.

/**
 * Product — dispositivo de domótica disponible para la venta.
 * See DOMAIN.md › Product Core.
 */
export interface Product {
  id: string;
  /** SKU del producto en el ERP. Es la unión con el ERP: precio y stock se
   *  piden por SKU (ADR-025 del ERP). Tiene que coincidir con el del ERP. */
  sku: string;
  name: string;
  description: string;
  /** Rutas relativas a las imágenes; la primera es la imagen principal. */
  images: string[];
  /** Categoría de catálogo: 'iluminacion' | 'automatizacion' | 'seguridad'. */
  category: string | null;
  isBestseller: boolean;
  /** Visibilidad en el storefront — `false` oculta el producto (Home, Catálogo,
   *  Detalle) sin borrarlo del dataset. */
  active: boolean;
}

/**
 * Estado de venta de un producto según el ERP.
 * - `available`: tiene precio y stock, se puede agregar al carrito.
 * - `out_of_stock`: tiene precio pero no stock.
 * - `no_price`: el ERP no respondió o no devolvió el SKU: "Consultar precio".
 * - `loading`: todavía no llegó la respuesta del ERP.
 */
export type Availability = 'available' | 'out_of_stock' | 'no_price' | 'loading';

/** Precio de venta de un producto, resuelto contra el ERP. */
export interface ProductPricing {
  /** Precio pagando con Mercado Pago; `null` si no hay precio del ERP. */
  price: number | null;
  /** Precio con transferencia, solo cuando es menor que `price`. */
  transferPrice: number | null;
  availability: Availability;
  /** Unidades que tiene el ERP. Solo viene con precio del ERP; sin dato, no
   *  hay tope de cantidad. */
  stock?: number;
}

/** Base URL y clave de la API de la tienda en el ERP (de `lib/env`). */
export interface StoreApiConfig {
  baseUrl: string;
  apiKey: string;
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
