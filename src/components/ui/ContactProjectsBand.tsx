// ContactProjectsBand — franja de proyectos de automatización (mock
// "Contáctanos"): viviendas enteras y obras para constructoras y arquitectos.
//
// Todavía no es una oferta de la tienda: el dueño la decide antes del deploy
// (2026-11-06). `ContactoPage` la muestra solo en local (`isDevelopment`).
import Icon from '@/components/ui/Icon';

const HEADING_ID = 'proyectos-heading';

interface ContactProjectsBandProps {
  /** Link de WhatsApp; sin número configurado la franja va sin botón. */
  whatsAppHref: string | null;
}

export default function ContactProjectsBand({ whatsAppHref }: ContactProjectsBandProps) {
  return (
    <aside
      aria-labelledby={HEADING_ID}
      className="relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-container p-6 text-on-primary shadow-md md:p-10"
    >
      <span className="inline-flex items-center gap-2 self-start rounded-full bg-on-primary/15 px-3 py-1 text-label-sm font-bold uppercase tracking-wider">
        <Icon name="home" className="h-4 w-4" />
        EzyHome y arquitectura
      </span>
      <h2
        id={HEADING_ID}
        className="max-w-3xl text-headline-md font-extrabold md:text-headline-xl-mobile"
      >
        ¿Planeás automatizar toda tu vivienda o un proyecto inmobiliario?
      </h2>
      <p className="max-w-2xl text-body-lg text-on-primary/90">
        Diseñamos soluciones a medida para constructoras, arquitectos y propietarios que remodelan.
      </p>
      {whatsAppHref !== null && (
        <a
          href={whatsAppHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg bg-surface-container-lowest px-6 py-3 text-label-lg font-bold text-primary shadow-sm transition hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-primary focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          <Icon name="chat" />
          Escribinos
        </a>
      )}
    </aside>
  );
}
