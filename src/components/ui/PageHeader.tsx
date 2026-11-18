// PageHeader — el encabezado común de las páginas de contenido: franja clara
// de borde a borde con la ruta de navegación, el título (el único `h1`) y la
// bajada. Todas lo usan con el mismo alto y los mismos márgenes, así la ruta y
// el título quedan en el mismo lugar al pasar de una página a otra.
//
// Lo usan el catálogo, el blog, Cómo comprar, Quiénes somos, Contacto y los
// 404. El Inicio (hero), el detalle de producto y el flujo de compra (carrito,
// checkout, pedido) tienen encabezado propio. Ver frontend-conventions §6.
import type { ReactNode } from 'react';
import Breadcrumb, { type BreadcrumbItem } from '@/components/ui/Breadcrumb';
import Container from '@/components/ui/Container';
import { cn } from '@/lib/cn';

type Align = 'start' | 'center';

interface PageHeaderProps {
  /** Id del `h1`, nombra la sección (`aria-labelledby`). */
  id: string;
  /** Pasos después de Inicio; el último es esta página. */
  breadcrumb: readonly BreadcrumbItem[];
  title: ReactNode;
  align?: Align;
  /** Bajada debajo del título. */
  children?: ReactNode;
}

/** Clases del título de página: las comparten los encabezados propios. */
export const PAGE_TITLE_CLASS =
  'text-headline-xl-mobile font-extrabold tracking-tight text-on-surface md:text-headline-xl lg:text-5xl lg:leading-tight';

const alignClasses: Record<Align, string> = {
  start: 'items-start text-left',
  center: 'items-center text-center',
};

export default function PageHeader({
  id,
  breadcrumb,
  title,
  align = 'start',
  children,
}: PageHeaderProps) {
  return (
    <section
      aria-labelledby={id}
      className="relative w-full overflow-hidden bg-surface-container-low"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
      />
      <Container className="relative flex flex-col gap-4 pb-12 pt-2 md:pb-16">
        <Breadcrumb items={breadcrumb} className="mb-4 md:mb-8" />
        <div className={cn('flex flex-col gap-4', alignClasses[align])}>
          <h1 id={id} className={PAGE_TITLE_CLASS}>
            {title}
          </h1>
          {children !== undefined && (
            <div className="max-w-3xl text-body-lg text-on-surface-variant">{children}</div>
          )}
        </div>
      </Container>
    </section>
  );
}
