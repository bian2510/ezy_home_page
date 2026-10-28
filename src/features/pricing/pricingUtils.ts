// Reglas puras de precio y stock de la tienda. Sin React ni red: reciben las
// cotizaciones del ERP ya traídas por `storeApi`.
import type { Availability, Product, ProductPricing } from '@/types';
import type { StoreQuote } from './storeApi';

/** Estado de la consulta al ERP. */
export type PricingStatus = 'loading' | 'ready' | 'unavailable';

/** Cotizaciones por SKU normalizado. */
export type QuoteIndex = ReadonlyMap<string, StoreQuote>;

/** El ERP compara los SKU sin mayúsculas ni espacios alrededor; acá igual. */
const normalizeSku = (sku: string): string => sku.trim().toLowerCase();

export const indexQuotes = (quotes: StoreQuote[]): QuoteIndex =>
  new Map(quotes.map((quote) => [normalizeSku(quote.sku), quote]));

const NO_PRICE: ProductPricing = { price: null, transferPrice: null, availability: 'no_price' };
const LOADING: ProductPricing = { price: null, transferPrice: null, availability: 'loading' };

/**
 * Precio de venta de un producto. Nunca usa el `price` del JSON: si el ERP no
 * respondió o no devolvió el SKU, el producto queda en "Consultar precio".
 * Con `mercadoPagoEnabled: false` el único precio es el de transferencia.
 */
export const resolvePricing = (
  product: Product,
  status: PricingStatus,
  quotes: QuoteIndex,
  { mercadoPagoEnabled = true }: { mercadoPagoEnabled?: boolean } = {},
): ProductPricing => {
  if (status === 'loading') return LOADING;
  if (status === 'unavailable') return NO_PRICE;

  const quote = quotes.get(normalizeSku(product.sku));
  if (quote === undefined) return NO_PRICE;

  const availability = quote.available ? 'available' : 'out_of_stock';
  // Sin Mercado Pago activo se cobra por transferencia o efectivo al retirar:
  // un solo precio, el de transferencia (usuario, 2026-10-28).
  if (!mercadoPagoEnabled) return { price: quote.priceTransfer, transferPrice: null, availability };

  return {
    price: quote.priceMp,
    transferPrice: quote.priceTransfer < quote.priceMp ? quote.priceTransfer : null,
    availability,
  };
};

/** Solo se agrega al carrito lo que el ERP confirma con precio y stock. */
export const isPurchasable = (availability: Availability): boolean => availability === 'available';

/** Texto que reemplaza al botón de compra; `null` si no corresponde. */
export const unavailableLabel = (availability: Availability): string | null => {
  switch (availability) {
    case 'out_of_stock':
      return 'Sin stock';
    case 'no_price':
      return 'Consultar precio';
    default:
      return null;
  }
};

/** SKU del catálogo que el ERP no devolvió (desincronizados o sin precio). */
export const findMissingSkus = (products: Product[], quotes: QuoteIndex): string[] =>
  products.map((product) => product.sku).filter((sku) => !quotes.has(normalizeSku(sku)));

/** Link de WhatsApp para consultar precio o stock de un producto. */
export const buildConsultUrl = (product: Product, phoneNumber: string): string =>
  `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    `Hola! Quiero consultar por: ${product.name}`,
  )}`;
