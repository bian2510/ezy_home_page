// CartPage — /carrito route. Lists the visitor's cart, exposes per-item
// quantity controls, surfaces the running total, and pre-composes the
// WhatsApp checkout message.
//
// Business rules (see DOMAIN.md):
// - El checkout v1 cierra vía WhatsApp; el botón Comprar pre-compone el
//   mensaje en un tap (no copy-paste manual).
// - El carrito persiste en localStorage; cuando la persistencia falla
//   (`storageAvailable === false`) se advierte al usuario.
// - Empty state: mensaje + link a /catalogo para recuperar la navegación.
import { Link } from 'react-router-dom';
import { useCart } from './useCart';
import CartItem from './CartItem';
import { buildWhatsAppMessage } from './cartUtils';
import { formatPrice } from '@/types';

// Vite injects env vars at build time under `import.meta.env`. The repo does
// not yet ship a `vite-env.d.ts`, so we read the value through a narrow type
// assertion rather than augmenting global types from a feature module.
const WHATSAPP_PHONE_NUMBER =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_WHATSAPP_NUMBER ?? '';

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, storageAvailable } =
    useCart();

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
  };

  return (
    <section className="mx-auto w-full max-w-content px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
        Mi Carrito
      </h1>

      {!storageAvailable && (
        <p
          role="status"
          className="mt-4 rounded-md border border-warning bg-warning/10 px-3 py-2 text-sm text-warning-foreground"
        >
          El carrito no se guardará entre sesiones.
        </p>
      )}

      {isEmpty ? (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-md border border-border bg-card px-4 py-12 text-center">
          <p className="text-base text-muted-foreground">
            Tu carrito está vacío.
          </p>
          <Link
            to="/catalogo"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-md border border-border bg-card px-4">
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

      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-semibold text-foreground">
          Total:{' '}
          <span className="font-mono">{formatPrice(total)}</span>
        </p>
        <button
          type="button"
          onClick={handleCheckout}
          disabled={isEmpty}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Comprar por WhatsApp
        </button>
      </div>
    </section>
  );
}
