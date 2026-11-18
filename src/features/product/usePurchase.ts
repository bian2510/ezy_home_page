// usePurchase — estado de compra del detalle: cantidad elegida, topes de stock
// y la acción de agregar al carrito. Lo comparten el panel de compra y la
// barra fija del celular, así los dos agregan lo mismo con las mismas reglas.
import { useState } from 'react';
import type { Product, ProductPricing } from '@/types';
import { useCart } from '@/features/cart';
import { isPurchasable, usePricing } from '@/features/pricing';
import { useToast } from '@/features/toast';
import { resolvePurchase } from './productUtils';

const MIN_QUANTITY = 1;

export interface Purchase {
  pricing: ProductPricing;
  quantity: number;
  /** Tope del selector; `undefined` sin dato de stock. */
  max: number | undefined;
  setQuantity: (quantity: number) => void;
  /** Hay compra posible o todavía carga el precio: se muestra el botón (y no el link a WhatsApp). */
  showsBuyButton: boolean;
  /** El botón está habilitado: precio y stock del ERP, y queda stock para el carrito. */
  canAdd: boolean;
  /** Aviso "Llegaste al máximo de unidades disponibles". */
  atStockLimit: boolean;
  add: () => void;
}

export function usePurchase(product: Product): Purchase {
  const { addItem, items } = useCart();
  const { addToast } = useToast();
  const pricing = usePricing().pricingOf(product);
  const [selected, setQuantity] = useState(MIN_QUANTITY);
  const inCart = items.find((item) => item.product.id === product.id)?.quantity ?? 0;
  const { quantity, max, noneLeft, atStockLimit } = resolvePurchase(
    pricing.stock,
    inCart,
    selected,
  );
  const purchasable = isPurchasable(pricing.availability);

  const add = () => {
    addItem(product, quantity);
    addToast(`${quantity > 1 ? `${quantity}x ` : ''}${product.name} agregado al carrito`);
  };

  return {
    pricing,
    quantity,
    max,
    setQuantity,
    showsBuyButton: purchasable || pricing.availability === 'loading',
    canAdd: purchasable && !noneLeft,
    atStockLimit: atStockLimit && pricing.availability === 'available',
    add,
  };
}
