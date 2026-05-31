import Drawer from '@/components/ui/Drawer';
import { useCart } from './useCart';
import CartContents from './CartContents';

export default function CartDrawer() {
  const { isCartOpen, closeCart } = useCart();

  return (
    <Drawer isOpen={isCartOpen} onClose={closeCart} title="Tu carrito">
      <CartContents onClose={closeCart} />
    </Drawer>
  );
}
