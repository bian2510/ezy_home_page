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
  const stock = Math.max(quote.stock, 0);
  if (!mercadoPagoEnabled) {
    return { price: quote.priceTransfer, transferPrice: null, availability, stock };
  }

  return {
    price: quote.priceMp,
    transferPrice: quote.priceTransfer < quote.priceMp ? quote.priceTransfer : null,
    availability,
    stock,
  };
};

/**
 * Descuento por pagar con transferencia frente a Mercado Pago, en puntos
 * porcentuales enteros, redondeado al más cercano: $ 18.900 contra $ 18.000
 * (4,76 %) muestra "-5%" (usuario, 2026-11-03). `null` si no hay descuento que
 * mostrar: sin precio del ERP, sin Mercado Pago activo, precios en cero o
 * negativos (dato roto, no un "-100%"), transferencia que no es más barata, o
 * un descuento que redondeado da 0.
 *
 * Se multiplica antes de dividir: `(100 - 71) / 100 * 100` da 28,999… en coma
 * flotante y quedaba al borde del redondeo; `(29 * 100) / 100` da 29 exacto
 * con precios enteros, que es lo que manda el ERP.
 */
export const transferDiscountPercent = (pricing: ProductPricing): number | null => {
  const { price, transferPrice } = pricing;
  if (price === null || transferPrice === null) return null;
  if (price <= 0 || transferPrice <= 0 || transferPrice >= price) return null;
  const percent = Math.round(((price - transferPrice) * 100) / price);
  return percent >= 1 ? percent : null;
};

/** Aviso al llegar al tope de stock: sin "Quedan N" (usuario, 2026-10-28). */
export const STOCK_LIMIT_MESSAGE = 'Llegaste al máximo de unidades disponibles';

/** `true` si no se pueden sumar más unidades: ya hay tantas como stock del ERP. */
export const reachedStockLimit = (pricing: ProductPricing, quantity: number): boolean =>
  pricing.stock !== undefined && quantity >= pricing.stock;

/**
 * Cantidad ajustada al stock del ERP. Sin dato de stock o con stock 0 no se
 * toca: sin stock el producto ya se muestra agotado y no se puede comprar.
 */
export const clampToStock = (pricing: ProductPricing, quantity: number): number =>
  pricing.stock !== undefined && pricing.stock > 0 ? Math.min(quantity, pricing.stock) : quantity;

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
