// Parámetros del Meta Pixel con el precio del ERP. El valor de cada producto
// es el precio que se muestra como principal (el de transferencia cuando es
// menor), el mismo con el que el carrito suma su total.
import type { CartItem, Product, ProductPricing } from '@/types';
import { pixelLine, pixelParams, type PixelParams } from '@/lib/metaPixel';

const shownPrice = (pricing: ProductPricing): number | null =>
  pricing.transferPrice ?? pricing.price;

/** Un producto con la cantidad elegida (ver detalle, agregar al carrito, consultar). */
export const productPixelParams = (
  product: Product,
  pricing: ProductPricing,
  quantity: number,
): PixelParams => pixelParams([pixelLine(product, quantity, shownPrice(pricing))]);

/** El carrito entero (inicio de compra, pedido por WhatsApp). */
export const cartPixelParams = (
  items: CartItem[],
  pricingOf: (product: Product) => ProductPricing,
): PixelParams =>
  pixelParams(
    items.map((item) =>
      pixelLine(item.product, item.quantity, shownPrice(pricingOf(item.product))),
    ),
  );
