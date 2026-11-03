// CartSummary — totales del carrito y cómo cerrar la compra: con retiro en
// punto pick-up (checkout) si todo tiene precio y stock, o por WhatsApp. La usan el
// drawer y la página `/carrito`.
import { Link } from 'react-router-dom';
import { formatPrice } from '@/lib/formatPrice';
import { cn } from '@/lib/cn';
import type { CartContentsState } from './useCartContents';

interface CartSummaryProps {
  cart: CartContentsState;
  /** Al ir al checkout o a WhatsApp: el drawer se cierra. */
  onClose?: (() => void) | undefined;
}

export default function CartSummary({ cart, onClose }: CartSummaryProps) {
  const { total, transferTotal, hasUnpriced, canCheckout, isEmpty } = cart;
  const cheaperByTransfer = transferTotal < total;

  const handleWhatsApp = () => {
    cart.checkoutByWhatsApp();
    if (!isEmpty) onClose?.();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 rounded-xl bg-surface-container-low p-4">
        <p
          data-testid="main-total"
          className="flex items-end justify-between gap-4 text-label-lg font-bold text-on-surface"
        >
          {cheaperByTransfer ? 'Total con transferencia: ' : 'Total: '}
          <span className="text-headline-md font-extrabold tabular-nums text-primary">
            {formatPrice(cheaperByTransfer ? transferTotal : total)}
          </span>
        </p>
        {cheaperByTransfer && (
          <p data-testid="secondary-total" className="text-body-sm text-secondary">
            Con Mercado Pago:{' '}
            <span className="font-semibold tabular-nums">{formatPrice(total)}</span>
          </p>
        )}
        {hasUnpriced && (
          <p className="text-body-sm text-secondary">
            Los productos sin precio te los cotizamos por WhatsApp.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {canCheckout && (
          <Link
            to="/checkout"
            onClick={onClose}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-primary px-6 py-2 text-label-lg font-bold text-on-primary shadow-md transition-all hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Comprar con retiro en punto pick-up
          </Link>
        )}
        <button
          type="button"
          onClick={handleWhatsApp}
          disabled={isEmpty}
          className={cn(
            'inline-flex min-h-11 w-full items-center justify-center rounded-lg px-6 py-2 text-label-lg font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
            canCheckout
              ? 'border border-primary bg-surface-container-lowest text-primary hover:bg-surface-container-low'
              : 'bg-primary text-on-primary hover:bg-primary-container',
          )}
        >
          Comprar por WhatsApp
        </button>
        <p className="text-center text-body-sm text-secondary">Envíos: coordinamos por WhatsApp.</p>
      </div>
    </div>
  );
}
