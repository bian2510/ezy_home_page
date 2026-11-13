// QuienesSomosPage — la tienda, su misión y para quién es. No hay mock de
// Stitch para esta página (2026-11-12): se arma con las piezas del rediseño
// (`PageHeader`, tarjetas como las del Inicio) y el mismo texto de antes, que
// está en `data/aboutUs.ts`.
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/Icon';
import PageHeader from '@/components/ui/PageHeader';
import SectionBand from '@/components/ui/SectionBand';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { cn } from '@/lib/cn';
import { COMMITMENTS, PROFILES } from '@/data/aboutUs';

const actionBase =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-6 py-3 text-label-lg font-bold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed focus-visible:ring-offset-2 focus-visible:ring-offset-inverse-surface';

export default function QuienesSomosPage() {
  useDocumentMeta({
    title: 'Quiénes Somos',
    description:
      'Somos EzyHome, una tienda argentina de domótica que cree que el hogar inteligente debe estar al alcance de todos, no solo de los expertos.',
    path: '/quienes-somos',
  });

  return (
    <>
      <PageHeader
        id="quienes-somos-heading"
        breadcrumb={[{ label: 'Quiénes Somos' }]}
        title="Quiénes Somos"
      >
        Somos <span className="font-bold text-primary">EzyHome</span>, una tienda argentina de
        domótica que cree que el hogar inteligente debe estar al alcance de todos, no solo de los
        expertos.
      </PageHeader>

      <SectionBand label="Misión de EzyHome" tone="surface" className="py-12 md:py-20">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <section
            aria-labelledby="mision-heading"
            className="flex flex-col gap-4 rounded-2xl bg-surface-container-lowest p-6 shadow-sm sm:p-8"
          >
            <span className="text-label-sm font-bold uppercase tracking-wider text-primary">
              Lo que nos mueve
            </span>
            <h2 id="mision-heading" className="text-headline-md font-bold text-on-surface">
              Nuestra misión
            </h2>
            <p className="text-body-lg text-on-surface-variant">
              Masificar la domótica haciéndola accesible, simple y confiable para hogares argentinos
              de todos los perfiles. Creemos que cualquier persona (joven, adulto mayor o cuidador
              de familia) puede adoptar la tecnología del hogar inteligente sin ser un experto.
            </p>
          </section>

          <section
            aria-labelledby="problema-heading"
            className="flex flex-col gap-4 rounded-2xl bg-inverse-surface p-6 text-inverse-on-surface shadow-sm sm:p-8"
          >
            <span className="text-label-sm font-bold uppercase tracking-wider text-primary-fixed">
              Por qué existimos
            </span>
            <h2
              id="problema-heading"
              className="text-headline-md font-bold text-inverse-on-surface"
            >
              El problema que resolvemos
            </h2>
            <p className="text-body-lg text-surface-container-highest">
              La domótica en Argentina es percibida como cara, compleja y exclusiva para personas
              técnicas. La mayoría de los hogares no accede porque no saben cómo empezar o los
              canales de venta no generan confianza.
            </p>
            <p className="text-body-lg text-surface-container-highest">
              EzyHome existe para cerrar esa brecha: una tienda profesional y accesible que
              demuestra que la domótica está a tu alcance.
            </p>
          </section>
        </div>
      </SectionBand>

      <SectionBand labelledBy="para-quien-heading" tone="low" className="gap-10 py-12 md:py-20">
        <div className="mx-auto flex max-w-2xl flex-col gap-2 text-center">
          <h2
            id="para-quien-heading"
            className="text-headline-xl-mobile font-bold text-on-surface md:text-headline-xl"
          >
            ¿Para quién es EzyHome?
          </h2>
          <p className="text-body-md text-on-surface-variant">
            No hace falta saber de tecnología. Solo hace falta querer mejorar tu hogar.
          </p>
        </div>
        <ul className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-3">
          {PROFILES.map(({ icon, title, detail }) => (
            <li
              key={title}
              className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-6 shadow-sm sm:p-8"
            >
              <span className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon name={icon} className="h-6 w-6" />
              </span>
              <h3 className="text-headline-sm font-bold text-on-surface">{title}</h3>
              <p className="text-body-md text-on-surface-variant">{detail}</p>
            </li>
          ))}
        </ul>
      </SectionBand>

      <SectionBand labelledBy="valores-heading" tone="surface" className="gap-10 py-12 md:py-20">
        <h2
          id="valores-heading"
          className="text-headline-xl-mobile font-bold text-on-surface md:text-headline-xl"
        >
          Nuestro compromiso
        </h2>
        <ul className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-3">
          {COMMITMENTS.map(({ icon, title, detail }) => (
            <li
              key={title}
              className="flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-6 shadow-sm"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-on-primary">
                <Icon name={icon} className="h-6 w-6" />
              </span>
              <h3 className="text-headline-sm font-bold text-on-surface">{title}</h3>
              <p className="text-body-md text-on-surface-variant">{detail}</p>
            </li>
          ))}
        </ul>

        <aside
          aria-labelledby="cierre-heading"
          className="flex flex-col gap-6 rounded-2xl bg-inverse-surface p-6 text-inverse-on-surface md:p-10 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="flex max-w-xl flex-col gap-2">
            <h2 id="cierre-heading" className="text-headline-md font-bold text-inverse-on-surface">
              Empezá a transformar tu hogar
            </h2>
            <p className="text-body-md text-surface-container-highest">
              Mirá el catálogo o escribinos: te ayudamos a elegir por dónde empezar.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
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
            <Link
              to="/contacto"
              className={cn(
                actionBase,
                'bg-surface-container-lowest/10 text-inverse-on-surface hover:bg-surface-container-lowest/20',
              )}
            >
              <Icon name="chat" className="h-4 w-4" />
              Contactanos
            </Link>
          </div>
        </aside>
      </SectionBand>
    </>
  );
}
