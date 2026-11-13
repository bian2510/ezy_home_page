// NotFoundState — el 404 de una página, con el mismo encabezado que el resto
// (`PageHeader`) y un link para volver a un lugar que sí existe. Lo usan la
// ruta desconocida, el producto que no está y el artículo que no está.
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/Icon';
import PageHeader from '@/components/ui/PageHeader';
import type { BreadcrumbItem } from '@/components/ui/Breadcrumb';

interface NotFoundStateProps {
  breadcrumb: readonly BreadcrumbItem[];
  message: string;
  /** A dónde vuelve el visitante. */
  back: { to: string; label: string };
}

export default function NotFoundState({ breadcrumb, message, back }: NotFoundStateProps) {
  return (
    <PageHeader id="not-found-heading" breadcrumb={breadcrumb} title="404">
      <div className="flex flex-col items-start gap-6">
        <p>{message}</p>
        <Link
          to={back.to}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-6 py-3 text-label-lg font-bold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Icon name="arrowLeft" className="h-4 w-4" />
          {back.label}
        </Link>
      </div>
    </PageHeader>
  );
}
