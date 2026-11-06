// CartContents — el carrito dentro del drawer: aviso si no se puede guardar,
// las filas compactas (o "Tu carrito está vacío") y, abajo, los totales y cómo
// comprar. La lógica vive en `useCartContents`, compartida con la página
// `/carrito`, que tiene su propio diseño de filas y resumen.
import { Link } from 'react-router-dom';
import CartDrawerItem from './CartDrawerItem';
import CartDrawerSummary from './CartDrawerSummary';
import { useCartContents } from './useCartContents';

interface CartContentsProps {
  /** Cierra el drawer: al ir al checkout, a WhatsApp, al catálogo o al seguir comprando. */
  onClose: () => void;
}

export default function CartContents({ onClose }: CartContentsProps) {
  const cart = useCartContents();
  const actions = {
    onIncrement: cart.increment,
    onDecrement: cart.decrement,
    onRemove: cart.remove,
  };

  return (
    <div className="flex h-full flex-col p-4">
      {!cart.storageAvailable && <StorageNotice />}

      {cart.isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
          <EmptyCartMessage onNavigate={onClose} />
        </div>
      ) : (
        <>
          <ul className="divide-y divide-outline/10">
            {cart.items.map((item) => (
              <CartDrawerItem key={item.product.id} item={item} actions={actions} />
            ))}
          </ul>
          <div className="mt-auto pt-4">
            <CartDrawerSummary cart={cart} onClose={onClose} />
          </div>
        </>
      )}
    </div>
  );
}

/** El navegador no deja guardar: el carrito se pierde al cerrar. */
export function StorageNotice() {
  return (
    <p
      role="status"
      className="mb-4 rounded-md border border-warning bg-warning/10 px-3 py-2 text-sm text-warning-foreground"
    >
      El carrito no se guardará entre sesiones.
    </p>
  );
}

/** "Tu carrito está vacío" y el link al catálogo. */
export function EmptyCartMessage({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  return (
    <>
      <p className="text-body-lg text-secondary">Tu carrito está vacío.</p>
      <Link
        to="/catalogo"
        onClick={onNavigate}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 text-label-lg font-bold text-on-primary transition hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        Ver productos
      </Link>
    </>
  );
}
