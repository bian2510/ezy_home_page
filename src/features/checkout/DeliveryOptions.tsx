// DeliveryOptions — formas de entrega del checkout. Hoy hay una sola, el
// retiro en el local (usuario, 2026-11-03); los envíos se van a sumar más
// adelante como otra entrada de `DELIVERY_OPTIONS`.
//
// La dirección y el horario del local los manda el ERP con el pedido creado
// (`pickup` en `ordersApi`): acá no se inventan, se muestran al confirmar.
import Icon, { type IconName } from '@/components/ui/Icon';

interface DeliveryOption {
  id: string;
  icon: IconName;
  title: string;
  price: string;
  detail: string;
}

const DELIVERY_OPTIONS: readonly DeliveryOption[] = [
  {
    id: 'pickup',
    icon: 'store',
    title: 'Retiro en el local',
    price: 'Sin cargo',
    detail: 'Te mostramos la dirección y el horario al confirmar el pedido.',
  },
];

export default function DeliveryOptions() {
  return (
    <ul className="grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2">
      {DELIVERY_OPTIONS.map(({ id, icon, title, price, detail }) => (
        <li key={id} className="flex items-start gap-3 rounded-xl bg-primary/10 p-4 shadow-sm">
          <Icon name={icon} className="mt-0.5 text-primary" />
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-label-lg font-bold text-on-surface">{title}</span>
              <span className="rounded-full bg-primary-fixed px-2 py-0.5 text-label-md font-bold text-on-surface">
                {price}
              </span>
            </div>
            <p className="text-body-sm text-secondary">{detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
