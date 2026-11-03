// BenefitCards — los tres beneficios del Home. Textos confirmados por el
// dueño (2026-11-03); Siri no va porque los productos no funcionan con ella.
import Icon, { type IconName } from '@/components/ui/Icon';

interface Benefit {
  icon: IconName;
  title: string;
  detail: string;
}

const BENEFITS: readonly Benefit[] = [
  {
    icon: 'bolt',
    title: 'Instalación Plug & Play',
    detail:
      'Sin reformas ni cables complicados. Configuración inicial guiada en menos de 3 minutos por dispositivo.',
  },
  {
    icon: 'link',
    title: 'Ecosistema universal',
    detail:
      'Integración con Google Assistant y Amazon Alexa, con dispositivos Wi-Fi, Zigbee y Bluetooth.',
  },
  {
    icon: 'chat',
    title: 'Soporte especializado',
    detail: 'Asistencia gratuita para resolver dudas de automatización e instalación.',
  },
];

export default function BenefitCards() {
  return (
    <ul
      aria-label="Beneficios de EzyHome"
      className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-3"
    >
      {BENEFITS.map(({ icon, title, detail }) => (
        <li
          key={title}
          className="flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-6 shadow-sm"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-on-primary">
            <Icon name={icon} className="h-6 w-6" />
          </span>
          <h3 className="text-headline-sm font-bold text-on-surface">{title}</h3>
          <p className="text-body-md text-secondary">{detail}</p>
        </li>
      ))}
    </ul>
  );
}
