// OrderInfoCards — "Retiro en punto pick-up" (dirección y horario del ERP, solo si
// vienen) y "Medio de pago" (con el estado real del pago).
import type { ReactNode } from 'react';
import Icon, { type IconName } from '@/components/ui/Icon';
import type { StoreOrder } from './ordersApi';
import { paymentMethodLabel } from './orderViewUtils';

interface InfoCardProps {
  id: string;
  icon: IconName;
  title: string;
  children: ReactNode;
}

function InfoCard({ id, icon, title, children }: InfoCardProps) {
  return (
    <section
      aria-labelledby={id}
      className="flex items-start gap-3 rounded-lg bg-surface-container-lowest p-4 shadow-sm"
    >
      <Icon name={icon} className="mt-0.5 text-primary" />
      <div className="flex min-w-0 flex-col gap-1">
        <h2
          id={id}
          className="text-label-sm font-bold uppercase tracking-wider text-on-surface-variant"
        >
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

export function PickupCard({ order }: { order: StoreOrder }) {
  return (
    <InfoCard id="retiro-heading" icon="pin" title="Retiro en punto pick-up">
      {order.pickup.address !== null && (
        <p className="text-label-lg font-bold text-on-surface">{order.pickup.address}</p>
      )}
      {order.pickup.hours !== null && (
        <p className="text-body-sm text-secondary">{order.pickup.hours}</p>
      )}
      <p className="text-body-sm text-secondary">
        Traé el número de pedido. Guardá esta página para volver a verla.
      </p>
    </InfoCard>
  );
}

interface PaymentCardProps {
  order: StoreOrder;
  /** Estado del pago: el de Mercado Pago (con sus acciones) o el de la transferencia. */
  children: ReactNode;
}

export function PaymentCard({ order, children }: PaymentCardProps) {
  return (
    <InfoCard id="pago-heading" icon="card" title="Medio de pago">
      <p className="text-label-lg font-bold text-on-surface">
        {paymentMethodLabel(order.paymentMethod)}
      </p>
      {children}
    </InfoCard>
  );
}
