// TrustStrip — franja con lo que la tienda ofrece hoy, debajo de la grilla.
//
// Solo afirmaciones verdaderas: el retiro en el punto pick-up de Caballito (checkout con retiro),
// el asesoramiento por WhatsApp y los medios de pago: transferencia o Mercado
// Pago, siempre activos (#42).
import Icon, { type IconName } from '@/components/ui/Icon';
import { SITE_CONTACT } from '@/data/siteContact';

interface TrustItem {
  icon: IconName;
  title: string;
  detail: string;
}

const TRUST_ITEMS: readonly TrustItem[] = [
  { icon: 'pin', title: SITE_CONTACT.pickupLabel, detail: 'Comprá online y retirá tu pedido' },
  { icon: 'chat', title: 'Asesoramiento por WhatsApp', detail: 'Te ayudamos a elegir' },
  {
    icon: 'card',
    title: 'Transferencia o Mercado Pago',
    detail: 'Elegís cómo pagar al comprar',
  },
];

export default function TrustStrip() {
  return (
    <ul aria-label="Por qué comprar en EzyHome" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {TRUST_ITEMS.map(({ icon, title, detail }) => (
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
