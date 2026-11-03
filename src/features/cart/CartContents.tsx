// CartContents — el carrito dentro del drawer: aviso si no se puede guardar,
// la lista (o "Tu carrito está vacío") y, abajo, los totales y cómo comprar.
// La lógica vive en `useCartContents`, compartida con la página `/carrito`.
import { Link } from 'react-router-dom';
import CartItemList from './CartItemList';
import CartSummary from './CartSummary';
import { useCartContents } from './useCartContents';

interface CartContentsProps {
  /** Called after a successful checkout tap — used by the drawer to close itself. */
  onClose?: () => void;
}

export default function CartContents({ onClose }: CartContentsProps) {
  const cart = useCartContents();

  return (
    <div className="flex h-full flex-col px-4 py-4 sm:px-6">
      {!cart.storageAvailable && <StorageNotice />}

      {cart.isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <EmptyCartMessage onNavigate={onClose} />
        </div>
      ) : (
        <CartItemList cart={cart} />
      )}

      <div className="mt-auto border-t border-border pt-4">
        <CartSummary cart={cart} onClose={onClose} />
      </div>
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
