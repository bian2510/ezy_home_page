// TrustStrip — franja con lo que la tienda ofrece hoy, debajo de la grilla.
//
// Solo afirmaciones verdaderas: el retiro en el local (checkout con retiro),
// el asesoramiento por WhatsApp y los medios de pago activos. Mercado Pago
// aparece solo si está habilitado (`VITE_MERCADOPAGO_ENABLED`).
import Icon, { type IconName } from '@/components/ui/Icon';
import { isMercadoPagoEnabled } from '@/lib/env';

interface TrustItem {
  icon: IconName;
  title: string;
  detail: string;
}

const trustItems = (mercadoPagoEnabled: boolean): TrustItem[] => [
  { icon: 'store', title: 'Retiro en el local', detail: 'Comprá online y retirá tu pedido' },
  { icon: 'chat', title: 'Asesoramiento por WhatsApp', detail: 'Te ayudamos a elegir' },
  {
    icon: 'card',
    title: mercadoPagoEnabled ? 'Transferencia o Mercado Pago' : 'Pago por transferencia',
    detail: mercadoPagoEnabled ? 'Elegís cómo pagar al comprar' : 'Te pasamos los datos al comprar',
  },
];

export default function TrustStrip() {
  return (
    <ul aria-label="Por qué comprar en EzyHome" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {trustItems(isMercadoPagoEnabled()).map(({ icon, title, detail }) => (
        <li
          key={title}
          className="flex items-center gap-3 rounded-xl bg-surface-container-lowest p-4 shadow-sm"
        >
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container text-primary">
            <Icon name={icon} />
          </span>
          <span className="flex flex-col">
            <span className="text-label-md font-semibold text-on-surface">{title}</span>
            <span className="text-body-sm text-secondary">{detail}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
