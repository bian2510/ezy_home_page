// SectionHeader — título de una sección del Home, con un lugar a la derecha
// (en escritorio) para chips, un link o una bajada.
import type { ReactNode } from 'react';

interface SectionHeaderProps {
  /** Id del `<h2>`, para el `aria-labelledby` de la sección. */
  id: string;
  title: string;
  children?: ReactNode;
}

export default function SectionHeader({ id, title, children }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <h2 id={id} className="text-headline-xl-mobile font-bold text-on-surface">
        {title}
      </h2>
      {children}
    </div>
  );
}
