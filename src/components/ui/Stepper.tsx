// Stepper — pasos numerados de lado a lado, como la franja del mock de la
// confirmación: círculos grandes unidos por una línea continua (los tramos ya
// hechos en `primary`, los que faltan en `outline-variant`), el nombre abajo
// de cada círculo y el actual en negrita. Ciego al dominio: recibe los nombres.
//
// Cada paso ocupa un tercio del ancho: en el celular los nombres cortos entran
// abajo del círculo (y si no, bajan de renglón), sin scroll de costado.
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
  current: 'bg-primary text-on-primary shadow-md ring-4 ring-primary/20',
  upcoming: 'bg-surface-container-highest text-on-surface-variant',
};

const labelClass: Record<StepState, string> = {
  done: 'font-medium text-on-surface-variant',
  current: 'font-bold text-primary',
  upcoming: 'font-medium text-on-surface-variant',
};

const srState: Record<StepState, string> = {
  done: ' (completado)',
  current: ' (paso actual)',
  upcoming: '',
};

export default function Stepper({ label, steps, current }: StepperProps) {
  return (
    <ol aria-label={label} className="flex w-full items-start">
      {steps.map((step, index) => {
        const state = stateOf(index, current);
        return (
          <li
            key={step}
            data-state={state}
            aria-current={state === 'current' ? 'step' : undefined}
            className="relative flex flex-1 flex-col items-center gap-2 text-center"
          >
            {/* Tramo de línea hasta el círculo siguiente, por detrás de los círculos. */}
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute left-1/2 top-5 h-1 w-full -translate-y-1/2 rounded-full sm:top-6',
                  index < current ? 'bg-primary' : 'bg-outline-variant',
                )}
              />
            )}
            <span
              aria-hidden="true"
              className={cn(
                'relative flex h-10 w-10 items-center justify-center rounded-full text-label-lg font-bold sm:h-12 sm:w-12',
                circleClass[state],
              )}
            >
              {state === 'done' ? <Icon name="check" className="h-5 w-5" /> : index + 1}
            </span>
            <span className={cn('px-1 text-label-md', labelClass[state])}>
              {`${index + 1}. ${step}`}
            </span>
            <span className="sr-only">{srState[state]}</span>
          </li>
        );
      })}
    </ol>
  );
}
