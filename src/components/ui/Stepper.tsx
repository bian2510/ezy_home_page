// Stepper — pasos numerados con el actual resaltado y los anteriores tildados,
// como la franja del mock del checkout. Ciego al dominio: recibe los nombres.
//
// En el celular solo se lee el nombre del paso actual; los demás quedan en el
// círculo (y para el lector de pantalla, completos).
import { cn } from '@/lib/cn';
import Icon from './Icon';

interface StepperProps {
  /** Nombre de la lista para el lector de pantalla. */
  label: string;
  steps: readonly string[];
  /** Índice del paso actual (desde 0). */
  current: number;
}

type StepState = 'done' | 'current' | 'upcoming';

const stateOf = (index: number, current: number): StepState =>
  index < current ? 'done' : index === current ? 'current' : 'upcoming';

const circleClass: Record<StepState, string> = {
  done: 'bg-primary text-on-primary',
  current: 'bg-primary-container text-on-primary shadow-sm',
  upcoming: 'bg-surface-container-highest text-on-surface-variant',
};

const labelClass: Record<StepState, string> = {
  done: 'sr-only font-medium text-on-surface sm:not-sr-only',
  current: 'font-bold text-primary',
  upcoming: 'sr-only font-medium text-on-surface-variant sm:not-sr-only',
};

const srState: Record<StepState, string> = {
  done: ' (completado)',
  current: ' (paso actual)',
  upcoming: '',
};

export default function Stepper({ label, steps, current }: StepperProps) {
  return (
    <ol aria-label={label} className="flex items-center gap-2 overflow-x-auto md:gap-4">
      {steps.map((step, index) => {
        const state = stateOf(index, current);
        return (
          <li
            key={step}
            aria-current={state === 'current' ? 'step' : undefined}
            className="flex shrink-0 items-center gap-2 md:gap-4"
          >
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-label-md font-bold',
                  circleClass[state],
                )}
              >
                {state === 'done' ? <Icon name="check" className="h-4 w-4" /> : index + 1}
              </span>
              <span className={cn('text-label-md', labelClass[state])}>
                {`${index + 1}. ${step}`}
              </span>
              <span className="sr-only">{srState[state]}</span>
            </span>
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  'h-0.5 w-6',
                  state === 'done' ? 'bg-primary/40' : 'bg-outline-variant',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
