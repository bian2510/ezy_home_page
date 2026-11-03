// OrderHero — cabecera de la confirmación: ícono, etiqueta, título y bajada
// según el estado (`orderHero`). El tilde grande es solo para un pedido
// pagado; uno que espera el pago lleva un reloj, y uno cerrado, un aviso.
import Icon, { type IconName } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import type { OrderHero as OrderHeroData, OrderHeroTone } from './orderViewUtils';

const ICON: Record<OrderHeroTone, IconName> = {
  confirmed: 'check',
  received: 'clock',
  closed: 'info',
};

const ICON_CLASS: Record<OrderHeroTone, string> = {
  confirmed: 'bg-primary-container text-on-primary shadow-lg',
  received: 'bg-surface-container text-primary shadow-sm',
  closed: 'bg-surface-container-high text-on-surface-variant',
};

export default function OrderHero({ hero }: { hero: OrderHeroData }) {
  return (
    <div className="relative flex flex-col items-center gap-2 text-center">
      {/* Brillo detrás del ícono, como el mock. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <span
        aria-hidden="true"
        className={cn(
          'relative mb-2 flex h-20 w-20 items-center justify-center rounded-full',
          ICON_CLASS[hero.tone],
        )}
      >
        <Icon name={ICON[hero.tone]} className="h-10 w-10" />
      </span>
      <span className="relative text-label-sm font-bold uppercase tracking-wider text-primary">
        {hero.eyebrow}
      </span>
      <h1 className="relative text-headline-xl-mobile font-bold text-on-surface sm:text-headline-xl">
        {hero.title}
      </h1>
      {hero.body !== null && (
        <p className="relative max-w-xl text-body-lg text-on-surface-variant">{hero.body}</p>
      )}
    </div>
  );
}
