import { Link } from 'react-router-dom';
import { useCart } from './useCart';
import CartItem from './CartItem';
import { buildWhatsAppMessage } from './cartUtils';
import { formatPrice } from '@/types';

const WHATSAPP_PHONE_NUMBER =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_WHATSAPP_NUMBER ?? '';

interface CartContentsProps {
  /** Called after a successful checkout tap — used by the drawer to close itself. */
  onClose?: () => void;
}

export default function CartContents({ onClose }: CartContentsProps) {
  const { items, updateQuantity, removeItem, total, storageAvailable } = useCart();

  const isEmpty = items.length === 0;

  const handleIncrement = (productId: string) => {
    const current = items.find((item) => item.product.id === productId);
    if (current === undefined) return;
    updateQuantity(productId, current.quantity + 1);
  };

  const handleDecrement = (productId: string) => {
    const current = items.find((item) => item.product.id === productId);
    if (current === undefined) return;
    updateQuantity(productId, current.quantity - 1);
  };

  const handleCheckout = () => {
    if (isEmpty) return;
    const url = buildWhatsAppMessage(items, WHATSAPP_PHONE_NUMBER);
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose?.();
  };

  return (
    <div className="flex h-full flex-col px-4 py-4 sm:px-6">
      {!storageAvailable && (
        <p
          role="status"
          className="mb-4 rounded-md border border-warning bg-warning/10 px-3 py-2 text-sm text-warning-foreground"
        >
          El carrito no se guardará entre sesiones.
        </p>
      )}

      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-base text-muted-foreground">Tu carrito está vacío.</p>
          <Link
            to="/catalogo"
            onClick={onClose}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <CartItem
              key={item.product.id}
              item={item}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onRemove={removeItem}
            />
          ))}
        </ul>
      )}

      <div className="mt-auto border-t border-border pt-4">
        <p className="mb-3 text-base font-semibold text-foreground">
          Total: <span className="font-mono">{formatPrice(total)}</span>
        </p>
        <button
          type="button"
          onClick={handleCheckout}
          disabled={isEmpty}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Comprar por WhatsApp
        </button>
      </div>
    </div>
  );
}
