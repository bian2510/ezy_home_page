// ContactCard — card de un canal de contacto: ícono, título, el dato en una
// caja clara y la acción abajo (mock "Contáctanos"). Va dentro de un `<ul>`:
// las cards de la página son una lista de canales.
import type { ReactNode } from 'react';
import Icon, { type IconName } from '@/components/ui/Icon';

interface ContactCardProps {
  icon: IconName;
  title: string;
  /** El dato de contacto (teléfono, email, usuario), en la caja clara. */
  children: ReactNode;
  action: ReactNode;
}

export default function ContactCard({ icon, title, children, action }: ContactCardProps) {
  return (
    <li className="flex flex-col justify-between gap-6 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container/15 text-primary">
          <Icon name={icon} className="h-6 w-6" />
        </span>
        <h2 className="text-headline-sm font-bold text-on-surface">{title}</h2>
        <div className="flex min-h-11 items-center justify-between gap-2 rounded-lg bg-surface-container-low px-3 py-2 text-label-lg font-bold text-on-surface">
          {children}
        </div>
      </div>
      {action}
    </li>
  );
}
