// CartDrawer — el carrito desplegado desde el botón del header: card flotante
// bajo el header en `sm` y arriba, panel de alto completo en el celular.
import Drawer from '@/components/ui/Drawer';
import Icon from '@/components/ui/Icon';
import { useCart } from './useCart';
import CartContents from './CartContents';

export default function CartDrawer() {
  const { isCartOpen, closeCart, itemCount } = useCart();

  return (
    <Drawer
      variant="floating"
      isOpen={isCartOpen}
      onClose={closeCart}
      title={
        <>
          <Icon name="bag" className="h-6 w-6 text-primary" />
          <span>
            Tu carrito <span className="font-extrabold text-primary">({itemCount})</span>
          </span>
        </>
      }
    >
      <CartContents onClose={closeCart} />
    </Drawer>
  );
}
