// Eventos estándar del Meta Pixel (el script se carga en `index.html`).
//
// El Pixel solo registraba visitas (PageView): Meta no sabía quién agregaba al
// carrito ni quién compraba, y una campaña con objetivo "Ventas" no tenía de
// dónde aprender. Estos eventos le dicen qué producto se vio, qué se agregó,
// cuándo empezó la compra, qué se compró y por cuánto.
//
// Nunca rompe la compra: si el Pixel no cargó (bloqueador de anuncios, sin
// red) o tira un error, el evento se pierde y la tienda sigue igual.

/** Eventos estándar de Meta que usa la tienda. */
export type PixelEvent = 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase' | 'Contact';

/** Una línea en el formato de Meta: `id` es el SKU, el mismo del catálogo. */
export interface PixelLine {
  id: string;
  quantity: number;
  /** Precio unitario en ARS; sin precio del ERP no se manda. */
  item_price?: number;
}

export interface PixelParams {
  content_ids: string[];
  contents: PixelLine[];
  content_type: 'product';
  currency: 'ARS';
  num_items: number;
  /** Total en ARS. Falta si alguna línea no tiene precio: un valor bajo engaña más que ninguno. */
  value?: number;
}

/** Lo único del producto que le importa al Pixel. */
interface PixelProduct {
  id: string;
  sku: string;
}

/** Línea de un producto. Sin SKU (carrito viejo) se identifica por el id. */
export const pixelLine = (
  product: PixelProduct,
  quantity: number,
  unitPrice: number | null,
): PixelLine => ({
  id: product.sku === '' ? product.id : product.sku,
  quantity,
  ...(unitPrice === null ? {} : { item_price: unitPrice }),
});

/** Parámetros del evento: productos, cantidad total y valor en pesos. */
export const pixelParams = (lines: PixelLine[]): PixelParams => {
  const priced = lines.every((line) => line.item_price !== undefined);
  const value = lines.reduce((sum, line) => sum + (line.item_price ?? 0) * line.quantity, 0);
  return {
    content_ids: lines.map((line) => line.id),
    contents: lines,
    content_type: 'product',
    currency: 'ARS',
    num_items: lines.reduce((sum, line) => sum + line.quantity, 0),
    ...(priced ? { value } : {}),
  };
};

type Fbq = (...args: unknown[]) => void;

const pixel = (): Fbq | undefined => {
  if (typeof window === 'undefined') return undefined;
  const fbq: unknown = (window as Window & { fbq?: unknown }).fbq;
  return typeof fbq === 'function' ? (fbq as Fbq) : undefined;
};

/**
 * Manda un evento al Pixel. `eventId` hace que Meta cuente una sola vez el
 * mismo evento aunque llegue dos veces (por ejemplo, el número de pedido).
 */
export const trackPixel = (event: PixelEvent, params: PixelParams, eventId?: string): void => {
  const fbq = pixel();
  if (fbq === undefined) return;
  try {
    if (eventId === undefined) fbq('track', event, params);
    else fbq('track', event, params, { eventID: eventId });
  } catch {
    // El Pixel es medición: si falla, la compra sigue.
  }
};
