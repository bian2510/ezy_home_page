// Estado de la cotización del envío bajo la dirección: qué falta para cotizar,
// "calculando", el precio con el plazo o, si no hay cotización (todavía no hay
// envíos en el ERP, o la zona o los productos no entran), WhatsApp como
// respaldo (ADR-007). El link abre el chat con el pedido y la dirección ya
// escritos, para no repetir nada. Se anuncia al lector de pantalla cuando cambia.
import { buildWhatsAppMessage, useCart } from '@/features/cart';
import { usePricing } from '@/features/pricing';
import { formatPrice } from '@/lib/formatPrice';
import { getWhatsAppNumber } from '@/lib/env';
import { formatShippingAddress, type AddressForm } from './deliveryUtils';
import type { QuoteState } from './useShippingQuote';

function WhatsAppFallback({ address }: { address: AddressForm }) {
  const { items } = useCart();
  const { pricingOf } = usePricing();
  const number = getWhatsAppNumber();
  const text = 'escribinos por WhatsApp';
  const link =
    number === '' ? (
      text
    ) : (
      <a
        href={buildWhatsAppMessage(
          items,
          number,
          pricingOf,
          formatShippingAddress(address) ?? undefined,
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {text}
      </a>
    );
  return (
    <p className="text-body-sm text-on-surface">
      Todavía no podemos calcular el envío desde la web: {link} con tu pedido y te lo cotizamos
      antes de que pagues. También podés elegir el retiro sin cargo.
    </p>
  );
}

interface ShippingQuoteStatusProps {
  quote: QuoteState;
  /** Lo que cargó el comprador: va en el mensaje de WhatsApp del respaldo. */
  address: AddressForm;
}

export default function ShippingQuoteStatus({ quote, address }: ShippingQuoteStatusProps) {
  return (
    <div
      aria-live="polite"
      data-testid="shipping-quote"
      className="rounded-xl bg-surface-container-low p-4"
    >
      {quote.status === 'idle' && (
        <p className="text-body-sm text-secondary">
          Elegí tu provincia y poné tu código postal para calcular el envío.
        </p>
      )}
      {quote.status === 'loading' && (
        <p className="text-body-sm text-secondary">Calculando el envío…</p>
      )}
      {quote.status === 'ready' && (
        <div className="flex flex-col gap-1">
          <p className="flex flex-wrap items-baseline justify-between gap-2 text-label-lg font-bold text-on-surface">
            {quote.option.name}
            <span className="tabular-nums text-primary">{formatPrice(quote.option.price)}</span>
          </p>
          {quote.option.deliveryTime !== null && (
            <p className="text-body-sm text-secondary">{quote.option.deliveryTime}</p>
          )}
        </div>
      )}
      {quote.status === 'unavailable' && <WhatsAppFallback address={address} />}
    </div>
  );
}
