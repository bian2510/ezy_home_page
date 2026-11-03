// HowItWorks — "¿Cómo funciona EzyHome en tu día a día?": los tres pasos,
// desde recibir el producto hasta usarlo con rutinas.
import Icon, { type IconName } from '@/components/ui/Icon';

interface Step {
  number: string;
  icon: IconName;
  title: string;
  detail: string;
  /** Dato extra al pie de la tarjeta. */
  tag?: { icon: IconName; label: string };
}

const STEPS: readonly Step[] = [
  {
    number: '01',
    icon: 'cube',
    title: 'Recibí e instalá tu dispositivo',
    detail: 'Instalalo vos mismo siguiendo las instrucciones, según el tipo de producto.',
  },
  {
    number: '02',
    icon: 'mobile',
    title: 'Conectalo a tu celular',
    detail: 'Vinculalo fácilmente desde las apps Smart Life o Tuya Smart.',
    tag: { icon: 'wifi', label: 'Wi-Fi 2.4 GHz, Zigbee y Bluetooth' },
  },
  {
    number: '03',
    icon: 'sparkles',
    title: '¡Empezá a disfrutar!',
    detail:
      'Creá rutinas, configurá horarios y controlá tus dispositivos desde el celular: una forma más cómoda, práctica e inteligente de vivir.',
    tag: { icon: 'sparkles', label: 'Escenas y rutinas a tu medida' },
  },
];

const HEADING_ID = 'como-funciona-heading';

export default function HowItWorks() {
  return (
    <section aria-labelledby={HEADING_ID} className="flex flex-col gap-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-2 text-center">
        <span className="text-label-sm font-bold uppercase tracking-wider text-primary">
          Simple de verdad
        </span>
        <h2 id={HEADING_ID} className="text-headline-xl-mobile font-bold text-on-surface">
          ¿Cómo funciona EzyHome en tu día a día?
        </h2>
        <p className="text-body-md text-secondary">
          Tu hogar inteligente sin instalaciones complicadas y sin técnicos.
        </p>
      </div>

      <ol className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-3 md:gap-8">
        {STEPS.map(({ number, icon, title, detail, tag }) => (
          <li
            key={number}
            className="flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8"
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <span
                  aria-hidden="true"
                  className="text-headline-xl font-extrabold text-surface-container-highest"
                >
                  {number}
                </span>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container text-primary">
                  <Icon name={icon} className="h-6 w-6" />
                </span>
              </div>
              <h3 className="mt-8 text-headline-sm font-bold text-on-surface">{title}</h3>
              <p className="mt-2 text-body-md text-secondary">{detail}</p>
            </div>
            {tag && (
              <p className="mt-6 flex items-center gap-2 pt-4 text-label-md font-semibold text-primary">
                <Icon name={tag.icon} className="h-4 w-4" />
                {tag.label}
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
