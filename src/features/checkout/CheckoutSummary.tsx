// "Resumen de tu pedido" en `/checkout`: cada producto con su foto, cantidad y
// precio con el medio elegido, el subtotal, la entrega (retiro sin cargo o el
// envío cotizado, "A calcular" mientras no hay cotización) y el total que se va
// a cobrar. Abajo, la ayuda por WhatsApp si hay número.
import type { CartItem, Product, ProductPricing } from '@/types';
import Icon from '@/components/ui/Icon';
import { formatPrice } from '@/lib/formatPrice';
import { getWhatsAppNumber } from '@/lib/env';
import { checkoutSummaryRows } from './checkoutUtils';
import type { DeliveryMethod } from './deliveryUtils';
import type { PaymentMethod } from './ordersApi';

interface CheckoutSummaryProps {
  items: CartItem[];
  pricingOf: (product: Product) => ProductPricing;
  /** Total de los productos con el medio elegido. */
  subtotal: number;
  paymentMethod: PaymentMethod;
  /** Entrega elegida y su costo: 0 con retiro, `null` si falta cotizar. */
  delivery: { method: DeliveryMethod; cost: number | null };
}

const DELIVERY_LABEL: Record<DeliveryMethod, string> = {
  pickup: 'Retiro en punto pick-up',
  carrier: 'Envío a domicilio',
};

const deliveryValue = (cost: number | null): string => {
  if (cost === null) return 'A calcular';
  return cost === 0 ? 'Sin cargo' : formatPrice(cost);
};

const HEADING_ID = 'resumen-heading';

function HelpCard() {
  const number = getWhatsAppNumber();
  if (number === '') return null;
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-surface-container-low p-6">
      <p className="text-label-lg font-bold text-on-surface">¿Tenés dudas con tu compra?</p>
      <a
        href={`https://wa.me/${number}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-2 self-start rounded text-label-lg font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Icon name="chat" />
        Chateá por WhatsApp
      </a>
    </div>
  );
}

export default function CheckoutSummary({
  items,
  pricingOf,
  subtotal,
  paymentMethod,
  delivery,
}: CheckoutSummaryProps) {
  const rows = checkoutSummaryRows(items, pricingOf, paymentMethod);
  const total = subtotal + (delivery.cost ?? 0);

  return (
    <aside
      aria-labelledby={HEADING_ID}
      className="flex flex-col gap-6 lg:sticky lg:top-28 lg:col-span-4"
    >
      <div className="flex flex-col gap-5 rounded-xl bg-surface-container-lowest p-6 shadow-md">
        <div className="flex items-center justify-between gap-3">
          <h2 id={HEADING_ID} className="text-headline-sm font-bold text-on-surface">
            Resumen de tu pedido
          </h2>
          <span className="rounded-full bg-surface-container px-2 py-0.5 text-label-sm font-bold text-on-surface">
            {rows.length === 1 ? '1 producto' : `${rows.length} productos`}
          </span>
        </div>

        <ul className="flex list-none flex-col gap-4 p-0">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-container-low">
                {row.image !== null && (
                  <img
                    src={row.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-contain"
                  />
                )}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="line-clamp-2 text-label-lg font-bold text-on-surface">
                  {row.quantity} × {row.name}
                </span>
                <span className="text-headline-sm font-bold tabular-nums text-primary">
                  {formatPrice(row.lineTotal)}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <dl className="flex flex-col gap-2 text-body-md">
          <div className="flex justify-between gap-4">
            <dt className="text-secondary">Subtotal</dt>
            <dd className="tabular-nums text-on-surface">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-secondary">{DELIVERY_LABEL[delivery.method]}</dt>
            <dd className="font-bold tabular-nums text-primary">{deliveryValue(delivery.cost)}</dd>
          </div>
        </dl>

        <p
          data-testid="checkout-total"
          className="flex items-end justify-between gap-4 rounded-xl bg-surface-container-low p-4"
        >
          <span className="text-label-lg font-bold text-on-surface">Total a pagar</span>
          <span className="text-headline-md font-extrabold tabular-nums text-primary">
            {formatPrice(total)}
          </span>
        </p>
      </div>

      <HelpCard />
    </aside>
  );
}
