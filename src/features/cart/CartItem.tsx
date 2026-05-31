// CartItem — single row inside the cart list.
//
// Shows product name, unit price, quantity controls (clamped to min 1), an
// explicit remove button, and the line subtotal (qty × unit price). All
// monetary values are formatted in ARS.
//
// See DOMAIN.md › Product Core (Carrito) and Operational & Regulatory
// Constraints (Carrito persistente). The min-quantity invariant is enforced
// both here (decrement disabled at 1) and in CartProvider's reducer.
import type { CartItem as CartItemType } from '@/types';
import { formatPrice } from '@/types';
import { useToast } from '@/hooks/useToast';

const MIN_QUANTITY = 1;

interface CartItemProps {
  item: CartItemType;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
}

export default function CartItem({ item, onIncrement, onDecrement, onRemove }: CartItemProps) {
  const { product, quantity } = item;
  const { addToast } = useToast();
  const lineSubtotal = product.price * quantity;
  const atMinimum = quantity <= MIN_QUANTITY;

  const handleRemove = () => {
    onRemove(product.id);
    addToast(`${product.name} eliminado del carrito`, 'info');
  };

  return (
    <li className="flex flex-col gap-3 border-b border-border py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-base font-medium text-foreground">{product.name}</p>
        <p className="text-sm text-muted-foreground">{formatPrice(product.price)} c/u</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Disminuir cantidad"
          onClick={() => onDecrement(product.id)}
          disabled={atMinimum}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          −
        </button>
        <span
          aria-label="Cantidad"
          className="min-w-[2ch] text-center font-mono text-sm text-foreground"
        >
          {quantity}
        </span>
        <button
          type="button"
          aria-label="Aumentar cantidad"
          onClick={() => onIncrement(product.id)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          +
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <p className="font-mono text-base font-semibold text-foreground">
          {formatPrice(lineSubtotal)}
        </p>
        <button
          type="button"
          aria-label={`Eliminar ${product.name} del carrito`}
          onClick={handleRemove}
          className="text-sm text-destructive transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
        >
          Eliminar
        </button>
      </div>
    </li>
  );
}
