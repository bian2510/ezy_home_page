// CartDrawerSummary — totales y acciones del carrito desplegado: subtotal por
// unidades, envío (se coordina por WhatsApp; la web es con retiro), el total
// con transferencia grande y el de Mercado Pago chico, "Iniciar compra" (si
// todo tiene precio y stock), WhatsApp y "Seguir comprando". La página
// `/carrito` usa `CartSummary`, con su propio diseño.
import { Link } from 'react-router-dom';
import { formatPrice } from '@/lib/formatPrice';
import { cn } from '@/lib/cn';
import type { CartContentsState } from './useCartContents';

interface CartDrawerSummaryProps {
  cart: CartContentsState;
  /** Cierra el drawer: al ir al checkout, a WhatsApp o al seguir comprando. */
  onClose: () => void;
}

const row = 'flex items-center justify-between gap-4 text-body-md text-secondary';

export default function CartDrawerSummary({ cart, onClose }: CartDrawerSummaryProps) {
  const { total, transferTotal, hasUnpriced, canCheckout, itemCount } = cart;
  const cheaperByTransfer = transferTotal < total;

  const handleWhatsApp = () => {
    cart.checkoutByWhatsApp();
    onClose();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 rounded-xl border border-outline/10 bg-surface-container-lowest p-3 shadow-sm">
        <p className={row}>
          <span>{`Subtotal (${itemCount} ${itemCount === 1 ? 'producto' : 'productos'})`}</span>
          <span className="text-body-lg font-bold tabular-nums text-on-surface">
            {formatPrice(transferTotal)}
          </span>
        </p>
        <p className={row}>
          <span>Envío</span>
          <span className="text-right font-semibold text-primary">Lo coordinamos por WhatsApp</span>
        </p>
        <div aria-hidden="true" className="my-1 h-px bg-outline/20" />
        <p
          data-testid="main-total"
          className="flex items-baseline justify-between gap-4 text-headline-sm font-extrabold text-on-surface"
        >
          {cheaperByTransfer ? 'Total con transferencia' : 'Total'}
          <span className="text-headline-md font-extrabold tabular-nums text-primary">
            {formatPrice(transferTotal)}
          </span>
        </p>
        {cheaperByTransfer && (
          <p data-testid="secondary-total" className="text-right text-body-sm text-secondary">
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

      {canCheckout && (
        <Link
          to="/checkout"
          onClick={onClose}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-6 py-2 text-label-lg font-bold text-on-primary shadow-md transition-all hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Iniciar compra
        </Link>
      )}
      <button
        type="button"
        onClick={handleWhatsApp}
        className={cn(
          'inline-flex min-h-11 w-full items-center justify-center rounded-xl px-6 py-2 text-label-lg font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          canCheckout
            ? 'border border-primary bg-surface-container-lowest text-primary hover:bg-surface-container-low'
            : 'bg-primary text-on-primary shadow-md hover:bg-primary-container',
        )}
      >
        Comprar por WhatsApp
      </button>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-lg text-label-md font-semibold text-secondary transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Seguir comprando
      </button>
    </div>
  );
}
