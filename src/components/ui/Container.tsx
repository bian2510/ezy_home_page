import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Contenedor de página: centra el contenido en `max-w-content` (1280 px) con
 * los márgenes laterales del mock — 16 px en el celular, `gutter` (24 px)
 * desde `sm` y `margin` (48 px) desde `md`. Lo usan el header, el footer, el
 * `<main>` y cada franja del Home, así todo queda alineado.
 */
export default function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-content px-gutter-mobile sm:px-gutter md:px-margin',
        className,
      )}
    >
      {children}
    </div>
  );
}
