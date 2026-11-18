// DeliveryOptions — formas de entrega del checkout (ADR-007): retiro en punto
// pick-up de Caballito sin cargo (usuario, 2026-11-03) o envío a domicilio, cotizado por el
// ERP con la provincia y el CP antes de pagar. Si no hay cotización para esa
// zona o esos productos, `ShippingQuoteStatus` ofrece WhatsApp.
//
// El barrio va a la vista para decidir (`SITE_CONTACT.pickupArea`); la dirección
// exacta y el horario los manda el ERP con el pedido creado (`pickup` en
// `ordersApi`): acá no se inventan, se muestran al confirmar.
import Icon, { type IconName } from '@/components/ui/Icon';
import { SITE_CONTACT } from '@/data/siteContact';
import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/formatPrice';
import AddressFields from './AddressFields';
import ShippingQuoteStatus from './ShippingQuoteStatus';
import type { DeliveryMethod } from './deliveryUtils';
import type { CheckoutDelivery } from './useCheckoutDelivery';

interface OptionCardProps {
  option: { method: DeliveryMethod; icon: IconName; title: string; detail: string };
  price: string;
  checked: boolean;
  onSelect: (method: DeliveryMethod) => void;
}

function OptionCard({ option, price, checked, onSelect }: OptionCardProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-xl p-4 shadow-sm transition-colors focus-within:ring-2 focus-within:ring-primary',
        checked ? 'bg-primary/10 ring-2 ring-primary' : 'bg-surface-container-low',
      )}
    >
      <input
        type="radio"
        name="delivery"
        value={option.method}
        checked={checked}
        onChange={() => onSelect(option.method)}
        className="mt-1 h-4 w-4 accent-primary"
      />
      <Icon name={option.icon} className="mt-0.5 text-primary" />
      <span className="flex flex-1 flex-col gap-1">
        <span className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-label-lg font-bold text-on-surface">{option.title}</span>
          <span className="rounded-full bg-primary-fixed px-2 py-0.5 text-label-md font-bold text-on-surface">
            {price}
          </span>
        </span>
        <span className="text-body-sm text-secondary">{option.detail}</span>
      </span>
    </label>
  );
}

const PICKUP = {
  method: 'pickup',
  icon: 'pin',
  title: SITE_CONTACT.pickupLabel,
  detail: `Retirás en nuestro punto pick-up de ${SITE_CONTACT.pickupArea.neighborhood}. Te pasamos la dirección exacta y el horario al confirmar el pedido.`,
} as const;

const CARRIER = {
  method: 'carrier',
  icon: 'truck',
  title: 'Envío a domicilio',
  detail: 'Lo calculamos con tu código postal antes de que pagues.',
} as const;

const carrierPrice = (delivery: CheckoutDelivery): string =>
  delivery.method === 'carrier' && delivery.cost !== null
    ? formatPrice(delivery.cost)
    : 'Según tu CP';

export default function DeliveryOptions({ delivery }: { delivery: CheckoutDelivery }) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="sr-only">Forma de entrega</legend>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <OptionCard
          option={PICKUP}
          price="Sin cargo"
          checked={delivery.method === 'pickup'}
          onSelect={delivery.setMethod}
        />
        <OptionCard
          option={CARRIER}
          price={carrierPrice(delivery)}
          checked={delivery.method === 'carrier'}
          onSelect={delivery.setMethod}
        />
      </div>
      {delivery.method === 'carrier' && (
        <>
          <AddressFields
            address={delivery.address}
            errors={delivery.errors}
            onChange={delivery.changeAddress}
          />
          <ShippingQuoteStatus quote={delivery.quote} address={delivery.address} />
        </>
      )}
    </fieldset>
  );
}
