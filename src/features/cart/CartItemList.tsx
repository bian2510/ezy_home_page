// CartItemList — las filas del carrito, con sus acciones (`useCartContents`).
import CartItem from './CartItem';
import type { CartContentsState } from './useCartContents';

export default function CartItemList({ cart }: { cart: CartContentsState }) {
  return (
    <ul className="divide-y divide-surface-container">
      {cart.items.map((item) => (
        <CartItem
          key={item.product.id}
          item={item}
          onIncrement={cart.increment}
          onDecrement={cart.decrement}
          onRemove={cart.remove}
        />
      ))}
    </ul>
  );
}
