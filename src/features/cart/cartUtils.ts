// Cart utilities. Pure functions only — no React, no hooks, no side effects.
// See DOMAIN.md › How EzyHome Makes Money: el checkout v1 cierra vía WhatsApp.

import type { CartItem } from '@/types';
import { formatPrice } from '@/types';

const WHATSAPP_BASE_URL = 'https://wa.me/';
const GREETING = 'Hola! Quiero hacer un pedido:';
const SHIPPING_DISCLAIMER = '(Los precios no incluyen envío)';

const computeSubtotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

const formatLineItem = (item: CartItem): string =>
  `- ${item.quantity}x ${item.product.name} → ${formatPrice(item.product.price)} c/u`;

const composeMessage = (items: CartItem[]): string => {
  const lines = items.map(formatLineItem);
  const subtotal = computeSubtotal(items);
  return [
    GREETING,
    ...lines,
    `Subtotal: ${formatPrice(subtotal)}`,
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
): string => {
  const message = composeMessage(items);
  return `${WHATSAPP_BASE_URL}${phoneNumber}?text=${encodeURIComponent(message)}`;
};
