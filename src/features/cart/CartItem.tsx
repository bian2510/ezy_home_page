// CartItem — single row inside the cart list.
//
// Shows product name, unit price (from the ERP, via `usePricing`), quantity controls (clamped to min 1), an
// explicit remove button, and the line subtotal (qty × unit price). Con Mercado
// Pago activo la fila va con el precio de transferencia, como el total "con
// transferencia", y el de Mercado Pago chico abajo (`cartLinePrice`). All
// monetary values are formatted in ARS.
//
// See DOMAIN.md › Product Core (Carrito) and Operational & Regulatory
// Constraints (Carrito persistente). The min-quantity invariant is enforced
// both here (decrement disabled at 1) and in CartProvider's reducer. The
// increment stops at the ERP stock with a friendly notice (no "Quedan N").
import type { CartItem as CartItemType } from '@/types';
import { formatPrice } from '@/lib/formatPrice';
import { cartLinePrice } from './cartUtils';
import { useToast } from '@/features/toast';
import { STOCK_LIMIT_MESSAGE, reachedStockLimit, usePricing } from '@/features/pricing';
import QuantitySelector from '@/components/ui/QuantitySelector';

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
  // Precio del ERP; sin precio la línea queda en "Consultar precio".
  const pricing = usePricing().pricingOf(product);
  const linePrice = cartLinePrice(pricing, quantity);
  const atMaximum = reachedStockLimit(pricing, quantity);

  const handleRemove = () => {
    onRemove(product.id);
    addToast(`${product.name} eliminado del carrito`, 'info');
  };

  // El selector es el mismo del detalle: sus botones avisan +1 / −1 y acá se
  // traducen a las acciones del carrito, que vuelven a chequear el stock.
  const handleQuantity = (next: number) =>
    next > quantity ? onIncrement(product.id) : onDecrement(product.id);

  return (
    <li className="flex gap-4 py-4 first:pt-0 last:pb-0">
      <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-container-low">
        {product.images[0] !== undefined && (
          <img
            src={product.images[0]}
            alt=""
            loading="lazy"
            className="h-full w-full object-contain"
          />
        )}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          {product.category && (
            <span className="text-label-sm font-bold uppercase tracking-wider text-secondary">
              {product.category}
            </span>
          )}
          <p className="text-label-lg font-bold text-on-surface">{product.name}</p>
          <p className="text-body-sm text-secondary">
            {linePrice === null
              ? 'Consultar precio'
              : `${formatPrice(linePrice.unit)} c/u${linePrice.byTransfer ? ' con transferencia' : ''}`}
          </p>
          {linePrice?.mercadoPagoUnit != null && (
            <p className="text-body-sm text-secondary">
              {`${formatPrice(linePrice.mercadoPagoUnit)} c/u con Mercado Pago`}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <QuantitySelector
            value={quantity}
            onChange={handleQuantity}
            min={MIN_QUANTITY}
            max={pricing.stock}
          />
          <p className="text-headline-sm font-bold tabular-nums text-on-surface">
            {linePrice === null ? '—' : formatPrice(linePrice.line)}
          </p>
        </div>

        {atMaximum && (
          <p role="status" className="text-body-sm text-secondary">
            {STOCK_LIMIT_MESSAGE}
          </p>
        )}

        <button
          type="button"
          aria-label={`Eliminar ${product.name} del carrito`}
          onClick={handleRemove}
          className="inline-flex min-h-11 items-center self-start rounded text-label-md font-semibold text-destructive transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
        >
          Eliminar
        </button>
      </div>
    </li>
  );
}
