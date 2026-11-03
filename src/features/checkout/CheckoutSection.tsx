// CheckoutSection — tarjeta numerada del checkout ("1 Información de
// contacto", "2 Entrega", "3 Medio de pago"), como el mock.
import type { ReactNode } from 'react';

interface CheckoutSectionProps {
  /** Id del título (`aria-labelledby`). */
  id: string;
  step: number;
  title: string;
  children: ReactNode;
}

export default function CheckoutSection({ id, step, title, children }: CheckoutSectionProps) {
  return (
    <section
      aria-labelledby={id}
      className="flex flex-col gap-5 rounded-xl bg-surface-container-lowest p-6 shadow-sm md:p-8"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container text-label-md font-bold text-primary"
        >
          {step}
        </span>
        <h2 id={id} className="text-headline-sm font-bold text-on-surface">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
