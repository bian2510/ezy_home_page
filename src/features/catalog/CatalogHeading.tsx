// CatalogHeading — ruta de navegación (Inicio › Productos), título y bajada
// del catálogo.
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/Icon';

export default function CatalogHeading() {
  return (
    <div className="flex flex-col gap-2">
      <nav aria-label="Ruta de navegación">
        <ol className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
          <li>
            <Link
              to="/"
              className="inline-flex min-h-11 items-center gap-1 rounded hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:min-h-0"
            >
              <Icon name="home" className="h-4 w-4" />
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">
            <Icon name="chevronRight" className="h-3.5 w-3.5" />
          </li>
          <li aria-current="page" className="font-bold text-foreground">
            Productos
          </li>
        </ol>
      </nav>
      <h1 className="text-headline-xl-mobile font-extrabold text-foreground sm:text-headline-xl">
        Productos
      </h1>
      <p className="text-base text-muted-foreground">
        Encontrá las mejores soluciones en domótica e iluminación inteligente para transformar tu
        hogar.
      </p>
    </div>
  );
}
