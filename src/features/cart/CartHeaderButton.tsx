// CartHeaderButton — botón del carrito en el header: abre el drawer y muestra
// cuántas unidades hay y el total con los precios del ERP.
//
// El total es el de transferencia, el mismo precio grande de las cards; si
// algún producto no tiene precio del ERP no se muestra (ver `cartHeaderTotal`).
import Icon from '@/components/ui/Icon';
import { formatPrice } from '@/lib/formatPrice';
import { cn } from '@/lib/cn';
import { usePricing } from '@/features/pricing';
import { useCart } from './useCart';
import { cartHeaderTotal, computeCartTotals } from './cartUtils';

interface CartHeaderButtonProps {
  className?: string;
}

export default function CartHeaderButton({ className }: CartHeaderButtonProps) {
  const { items, itemCount, openCart } = useCart();
  const { pricingOf } = usePricing();
  const summary = itemCount > 0 ? cartHeaderTotal(computeCartTotals(items, pricingOf)) : null;
  const units = `${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}`;
  const total =
    summary === null ? '' : `, ${summary.label.toLowerCase()} ${formatPrice(summary.amount)}`;
  const label = itemCount > 0 ? `Carrito, ${units}${total}` : 'Carrito';

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={label}
      className={cn(
        'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg bg-surface-container-lowest px-3 text-on-surface shadow-sm',
        'transition hover:bg-surface-container-low',
        // Vive en el header: anillo blanco separado por el color del header.
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-primary focus-visible:ring-offset-2 focus-visible:ring-offset-header',
        className,
      )}
    >
      <span className="relative inline-flex">
        <Icon name="bag" className="h-6 w-6" />
        {itemCount > 0 && (
          <span
            data-testid="cart-badge"
            aria-hidden="true"
            className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-label-sm font-bold text-on-primary shadow-sm"
          >
            {itemCount}
          </span>
        )}
      </span>
      {summary !== null && (
        <span
          data-testid="cart-total"
          aria-hidden="true"
          className="hidden flex-col text-left leading-none sm:flex"
        >
          <span className="text-label-sm font-medium text-on-surface-variant">{summary.label}</span>
          <span className="mt-0.5 text-label-md font-bold tabular-nums">
            {formatPrice(summary.amount)}
          </span>
        </span>
      )}
    </button>
  );
}
