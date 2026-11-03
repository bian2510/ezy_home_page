import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ContainerProps {
  children: ReactNode;
  /** Clases del contenido (flex, grid, padding vertical…). */
  className?: string;
}

/**
 * Contenedor de página, calcado del mock: los márgenes laterales van por
 * fuera (`px-gutter-mobile sm:px-gutter md:px-margin`: 16, 24 y 48 px) y el
 * contenido mide hasta `max-w-content` (1280 px, el `max-w-7xl` del mock)
 * adentro. Con el margen y el ancho en el mismo elemento, el contenido quedaba
 * en 1184 px y en pantallas anchas se veía más angosto que el diseño.
 *
 * Lo usan el header, el footer, el `<main>` y cada franja del Home, así todo
 * queda alineado.
 */
export default function Container({ children, className }: ContainerProps) {
  return (
    <div className="w-full px-gutter-mobile sm:px-gutter md:px-margin">
      <div className={cn('mx-auto w-full max-w-content', className)}>{children}</div>
    </div>
  );
}
