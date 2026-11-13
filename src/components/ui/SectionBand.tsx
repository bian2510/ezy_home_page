// SectionBand — franja de borde a borde, con su fondo, y el contenido centrado
// en el `Container` del sitio. Calca las secciones de los mocks (`w-full
// bg-surface` / `bg-surface-container-low` + `max-w-7xl mx-auto`). Las páginas
// se arman con estas franjas: el `<main>` de `RootLayout` no tiene contenedor.
import type { ReactNode } from 'react';
import Container from '@/components/ui/Container';
import { cn } from '@/lib/cn';

type Tone = 'surface' | 'low';

interface SectionBandProps {
  /** Id del título de la sección (`aria-labelledby`). */
  labelledBy?: string;
  /** Nombre de la sección cuando no tiene título visible. */
  label?: string;
  tone: Tone;
  /** Clases del contenido (gap, padding vertical). */
  className?: string;
  children: ReactNode;
}

const toneClasses: Record<Tone, string> = {
  surface: 'bg-surface',
  low: 'bg-surface-container-low',
};

export default function SectionBand({
  labelledBy,
  label,
  tone,
  className,
  children,
}: SectionBandProps) {
  return (
    <section
      aria-labelledby={labelledBy}
      aria-label={label}
      className={cn('w-full', toneClasses[tone])}
    >
      <Container className={cn('flex flex-col', className)}>{children}</Container>
    </section>
  );
}
