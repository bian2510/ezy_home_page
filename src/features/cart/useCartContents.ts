// useCartContents — lógica del carrito que comparten el drawer y la página
// `/carrito`: totales, si se puede ir al checkout, el ajuste al stock del ERP y
// las acciones de cada fila. Antes vivía dentro de `CartContents`; se movió
// tal cual para que la página pueda tener su propio diseño.
import { useEffect } from 'react';
import { useCart } from './useCart';
import { buildWhatsAppMessage, computeCartTotals } from './cartUtils';
import { getWhatsAppNumber } from '@/lib/env';
import { clampToStock, isPurchasable, reachedStockLimit, usePricing } from '@/features/pricing';
import type { CartItem } from '@/types';

export interface CartContentsState {
  items: CartItem[];
  isEmpty: boolean;
  storageAvailable: boolean;
  total: number;
  transferTotal: number;
  hasUnpriced: boolean;
  /** Todo tiene precio y stock del ERP: se puede comprar con retiro en el local. */
  canCheckout: boolean;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  remove: (productId: string) => void;
  /** Abre WhatsApp con el pedido armado. */
  checkoutByWhatsApp: () => void;
}

export function useCartContents(): CartContentsState {
  const { items, updateQuantity, removeItem, storageAvailable } = useCart();
  const { pricingOf } = usePricing();
  const { total, transferTotal, hasUnpriced } = computeCartTotals(items, pricingOf);

  const isEmpty = items.length === 0;
  // Compra por transferencia con retiro: solo si todo tiene precio y stock del
  // ERP. Si no, se consulta por WhatsApp como siempre.
  const canCheckout =
    !isEmpty && items.every((item) => isPurchasable(pricingOf(item.product).availability));

  // Si el stock del ERP bajó desde que se armó el carrito, la cantidad se
  // ajusta al cargar (sin reserva de stock, ADR-025 del ERP §6).
  useEffect(() => {
    items.forEach((item) => {
      const allowed = clampToStock(pricingOf(item.product), item.quantity);
      if (allowed < item.quantity) updateQuantity(item.product.id, allowed);
    });
  }, [items, pricingOf, updateQuantity]);

  const increment = (productId: string) => {
    const current = items.find((item) => item.product.id === productId);
    if (current === undefined) return;
    if (reachedStockLimit(pricingOf(current.product), current.quantity)) return;
    updateQuantity(productId, current.quantity + 1);
  };

  const decrement = (productId: string) => {
    const current = items.find((item) => item.product.id === productId);
    if (current === undefined) return;
    updateQuantity(productId, current.quantity - 1);
  };

  const checkoutByWhatsApp = () => {
    if (isEmpty) return;
    const url = buildWhatsAppMessage(items, getWhatsAppNumber(), pricingOf);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return {
    items,
    isEmpty,
    storageAvailable,
    total,
    transferTotal,
    hasUnpriced,
    canCheckout,
    increment,
    decrement,
    remove: removeItem,
    checkoutByWhatsApp,
  };
}
