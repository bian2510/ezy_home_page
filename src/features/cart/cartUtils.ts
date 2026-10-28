// Cart utilities. Pure functions only — no React, no hooks, no side effects.
// See DOMAIN.md › How EzyHome Makes Money: el checkout v1 cierra vía WhatsApp.
//
// Los precios vienen del ERP: quien llama pasa `pricingOf` (de `usePricing`).
// El `price` del JSON nunca se cobra.

import type { CartItem, Product, ProductPricing } from '@/types';
import { formatPrice } from '@/lib/formatPrice';

const WHATSAPP_BASE_URL = 'https://wa.me/';
const GREETING = 'Hola! Quiero hacer un pedido:';
const SHIPPING_DISCLAIMER = '(Los precios no incluyen envío)';

type PricingOf = (product: Product) => ProductPricing;

export interface CartTotals {
  /** Total pagando con Mercado Pago, sin los productos sin precio. */
  total: number;
  /** Total pagando con transferencia, sin los productos sin precio. */
  transferTotal: number;
  /** `true` si algún producto del carrito no tiene precio del ERP. */
  hasUnpriced: boolean;
}

/** Totales del carrito con los precios del ERP. */
export const computeCartTotals = (items: CartItem[], pricingOf: PricingOf): CartTotals =>
  items.reduce<CartTotals>(
    (totals, item) => {
      const { price, transferPrice } = pricingOf(item.product);
      if (price === null) return { ...totals, hasUnpriced: true };
      return {
        ...totals,
        total: totals.total + price * item.quantity,
        transferTotal: totals.transferTotal + (transferPrice ?? price) * item.quantity,
      };
    },
    { total: 0, transferTotal: 0, hasUnpriced: false },
  );

const formatLineItem = (item: CartItem, pricingOf: PricingOf): string => {
  const { price } = pricingOf(item.product);
  const detail = price === null ? 'consultar precio' : `${formatPrice(price)} c/u`;
  return `- ${item.quantity}x ${item.product.name} → ${detail}`;
};

const composeMessage = (items: CartItem[], pricingOf: PricingOf): string => {
  const lines = items.map((item) => formatLineItem(item, pricingOf));
  const { total, transferTotal } = computeCartTotals(items, pricingOf);
  const transferLine =
    transferTotal < total ? [`Con transferencia: ${formatPrice(transferTotal)}`] : [];
  return [
    GREETING,
    ...lines,
    `Subtotal: ${formatPrice(total)}`,
    ...transferLine,
    SHIPPING_DISCLAIMER,
  ].join('\n');
};

/**
 * Build a WhatsApp deep-link URL that pre-composes the cart as a message.
 *
 * Returns `https://wa.me/{phoneNumber}?text={encoded message}`. The full message
 * is encoded with `encodeURIComponent` before embedding to prevent URL injection
 * and to preserve newlines, accents, and special characters.
 *
 * See DOMAIN.md › Design Implications: el botón de compra debe pre-componer el
 * mensaje en un tap; no puede requerir copiar y pegar manualmente.
 */
export const buildWhatsAppMessage = (
  items: CartItem[],
  phoneNumber: string,
  pricingOf: PricingOf,
): string => {
  const message = composeMessage(items, pricingOf);
  return `${WHATSAPP_BASE_URL}${phoneNumber}?text=${encodeURIComponent(message)}`;
};
