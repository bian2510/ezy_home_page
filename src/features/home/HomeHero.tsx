// HomeHero — portada del Home: H1, bajada, las dos acciones y dos datos
// destacados.
//
// Fondo oscuro con un degradé de tokens, sin foto: el mock usa una imagen que
// no es nuestra, y la única foto propia (`smart-bulb.jpg`) es un producto
// sobre blanco. Sin imagen, lo más grande de la primera pantalla es el H1 y el
// LCP no espera ninguna descarga.
//
// En el celular y la tablet va de borde a borde (rompe el padding del
// `<main>`, docs/frontend-conventions.md §6); en escritorio es una tarjeta
// dentro del ancho de contenido.
import { Link } from 'react-router-dom';
import Icon, { type IconName } from '@/components/ui/Icon';
import { getWhatsAppNumber } from '@/lib/env';
import { cn } from '@/lib/cn';

interface Highlight {
  icon: IconName;
  title: string;
  detail: string;
}

// Confirmados por el dueño (2026-11-03): la compatibilidad es por Smart Life.
const HIGHLIGHTS: readonly Highlight[] = [
  { icon: 'microphone', title: '100% compatible', detail: 'Con Alexa y Google Home' },
  { icon: 'bolt', title: 'Hasta un 30%', detail: 'De ahorro energético' },
];

const actionBase =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-6 py-3 text-label-lg font-bold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed focus-visible:ring-offset-2 focus-visible:ring-offset-inverse-surface';

export default function HomeHero() {
  const whatsAppNumber = getWhatsAppNumber();

  return (
    <section
      aria-labelledby="home-hero-heading"
      className={cn(
        'relative -mx-4 -mt-6 overflow-hidden bg-inverse-surface text-inverse-on-surface sm:-mx-6 lg:mx-0 lg:mt-0 lg:rounded-2xl',
      )}
    >
      {/* Brillo teal decorativo, solo con tokens de color. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-inverse-surface via-inverse-surface to-primary-container/60"
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-container/30 blur-3xl"
      />

      <div className="relative flex flex-col gap-10 px-4 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:px-12 lg:pb-20 lg:pt-20">
        <div className="flex max-w-3xl flex-col gap-5">
          <h1
            id="home-hero-heading"
            className="text-headline-xl-mobile font-extrabold tracking-tight text-inverse-on-surface sm:text-headline-xl lg:text-5xl lg:leading-tight"
          >
            Transformá tu hogar en un espacio{' '}
            <span className="text-primary-fixed">inteligente</span> y conectado.
          </h1>
          <p className="max-w-2xl text-body-lg text-surface-container-highest">
            Controlá la iluminación, el clima, la seguridad y el consumo desde el celular o con la
            voz. Descubrí soluciones de domótica para tu confort y tu tranquilidad.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link
              to="/catalogo"
              className={cn(
                actionBase,
                'bg-primary text-on-primary shadow-md hover:bg-primary-container',
              )}
            >
              Ver productos
              <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
            {/* Sin número configurado el link no lleva a ningún lado: no se muestra. */}
            {whatsAppNumber !== '' && (
              <a
                href={`https://wa.me/${whatsAppNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  actionBase,
                  'bg-surface-container-lowest/10 text-inverse-on-surface hover:bg-surface-container-lowest/20',
                )}
              >
                <Icon name="chat" className="h-4 w-4" />
                Contactanos
              </a>
            )}
          </div>
        </div>

        <ul className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:max-w-2xl">
          {HIGHLIGHTS.map(({ icon, title, detail }) => (
            <li
              key={title}
              className="flex items-center gap-3 rounded-xl bg-inverse-surface/60 p-3.5 shadow-sm"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-container/30 text-primary-fixed">
                <Icon name={icon} />
              </span>
              <span className="flex flex-col">
                <span className="text-headline-sm font-bold text-inverse-on-surface">{title}</span>
                <span className="text-body-sm text-surface-variant">{detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
