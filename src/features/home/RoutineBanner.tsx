// RoutineBanner — ejemplo de rutina ("Modo Cine") armada con productos que
// vendemos: luces regulables, motores de persianas y el control IR universal
// para el aire. Se dispara a mano o con Alexa; no promete que detecte la tele.
import Icon from '@/components/ui/Icon';

const HEADING_ID = 'modo-cine-heading';

export default function RoutineBanner() {
  return (
    <aside
      aria-labelledby={HEADING_ID}
      className="flex flex-col gap-6 rounded-2xl bg-inverse-surface p-6 text-inverse-on-surface md:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8"
    >
      <div className="flex max-w-xl flex-col gap-2">
        <span className="inline-flex items-center gap-2 text-label-sm font-bold uppercase tracking-wider text-primary-fixed">
          <Icon name="sparkles" className="h-4 w-4" />
          Rutina inteligente recomendada
        </span>
        <h3 id={HEADING_ID} className="text-headline-md font-bold text-inverse-on-surface">
          “Modo Cine”
        </h3>
        <p className="text-body-md text-surface-container-highest">
          Con un toque en la app o pidiéndoselo a Alexa, las luces bajan a un tono cálido, las
          persianas con motor bajan y el control IR pone el aire acondicionado en 22 °C.
        </p>
      </div>
      <p className="inline-flex items-center gap-2 self-start rounded-lg bg-surface-container-lowest/10 px-4 py-2.5 text-label-md text-inverse-on-surface lg:self-auto">
        <Icon name="microphone" className="h-4 w-4" />
        “Alexa, modo cine”
      </p>
    </aside>
  );
}
