// useCartLine — lo que necesita una fila del carrito, la de `/carrito`
// (`CartItem`) y la compacta del drawer (`CartDrawerItem`): el precio de la
// línea, el tope por stock del ERP y las acciones de cantidad y quitar.
import type { CartItem } from '@/types';
import { useToast } from '@/features/toast';
import { reachedStockLimit, usePricing } from '@/features/pricing';
import { cartLinePrice, type CartLinePrice } from './cartUtils';

export interface CartLineActions {
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
}

export interface CartLineState {
  /** `null` sin precio del ERP ("Consultar precio"). */
  linePrice: CartLinePrice | null;
  /** Stock del ERP, tope del selector de cantidad; `undefined` sin tope. */
  stock: number | undefined;
  /** Llegó al stock: se muestra `STOCK_LIMIT_MESSAGE`. */
  atMaximum: boolean;
  /** Para el `onChange` de `QuantitySelector`. */
  changeQuantity: (next: number) => void;
  /** Quita la fila y avisa con un toast. */
  remove: () => void;
}

export function useCartLine(item: CartItem, actions: CartLineActions): CartLineState {
  const { product, quantity } = item;
  const { addToast } = useToast();
  const pricing = usePricing().pricingOf(product);

  const remove = () => {
    actions.onRemove(product.id);
    addToast(`${product.name} eliminado del carrito`, 'info');
  };

  // El selector avisa +1 / −1 y acá se traduce a las acciones del carrito,
  // que vuelven a chequear el stock.
  const changeQuantity = (next: number) =>
    next > quantity ? actions.onIncrement(product.id) : actions.onDecrement(product.id);

  return {
    linePrice: cartLinePrice(pricing, quantity),
    stock: pricing.stock,
    atMaximum: reachedStockLimit(pricing, quantity),
    changeQuantity,
    remove,
  };
}
