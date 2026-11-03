// HomeHero — portada del Home: H1, bajada, las dos acciones y dos datos
// destacados. Franja oscura de borde a borde en todos los tamaños, como el
// mock; el contenido va en el `Container` del sitio.
//
// Foto de fondo (`homeHeroImage.ts`): es el LCP, así que es decorativa
// (`alt=""`), se pide primero (`fetchpriority="high"`, `loading="eager"`, y
// precargada en `index.html` solo en `/`) y dos velos de `inverse-surface`
// mantienen el contraste AA del texto. En el celular se encuadra en la vista a
// la ciudad (`object-hero`). Con `image={null}` queda el degradé de tokens.
import { Link } from 'react-router-dom';
import Container from '@/components/ui/Container';
import Icon, { type IconName } from '@/components/ui/Icon';
import { getWhatsAppNumber } from '@/lib/env';
import { cn } from '@/lib/cn';
import { HIGH_FETCH_PRIORITY } from '@/lib/fetchPriority';

import { HOME_HERO_IMAGE, type HeroImage } from './homeHeroImage';

interface HomeHeroProps {
  /** Foto de fondo; `null` deja solo el degradé. */
  image?: HeroImage | null;
}

interface HeroBackgroundProps {
  image: HeroImage | null;
}

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

function HeroBackground({ image }: HeroBackgroundProps) {
  if (image === null) {
    return (
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-inverse-surface via-inverse-surface to-primary-container/60" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-container/30 blur-3xl" />
      </div>
    );
  }
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <img
        src={image.src}
        srcSet={image.srcSet}
        sizes="100vw"
        alt=""
        loading="eager"
        decoding="async"
        {...HIGH_FETCH_PRIORITY}
        className="h-full w-full object-cover object-hero opacity-60 md:object-center"
      />
      {/* Velos del mock: oscurecen a la izquierda (texto) y abajo (datos). */}
      <div className="absolute inset-0 bg-gradient-to-r from-inverse-surface via-inverse-surface/85 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/60 to-transparent" />
    </div>
  );
}

export default function HomeHero({ image = HOME_HERO_IMAGE }: HomeHeroProps) {
  const whatsAppNumber = getWhatsAppNumber();

  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative w-full overflow-hidden bg-inverse-surface text-inverse-on-surface"
    >
      <HeroBackground image={image} />

      <Container className="relative flex flex-col justify-between gap-12 pb-16 pt-12 md:min-h-hero md:pb-28 md:pt-20">
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

        <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-3">
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
      </Container>
    </section>
  );
}
