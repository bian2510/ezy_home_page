// Campo de texto del checkout, con su ayuda o su error debajo. Lo usan los datos
// del comprador (`BuyerFields`) y la dirección del envío (`AddressFields`).
import type { ChangeEvent, HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

// Campos del mock: fondo `surface-container-low`, sin borde, blanco al enfocar.
export const CHECKOUT_INPUT_CLASS =
  'h-11 w-full rounded-lg border-0 bg-surface-container-low px-4 text-body-lg text-on-surface transition-colors focus:bg-surface-container-lowest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

/** Lo que define al `<input>`: tipo, teclado del celular y autocompletado. */
export interface InputKind {
  type?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete: string;
}

interface CheckoutTextFieldProps {
  id: string;
  label: string;
  input: InputKind;
  /** Ayuda fija bajo el campo; el error la reemplaza. */
  hint?: string;
  value: string;
  error: string | undefined;
  onChange: (value: string) => void;
}

/** `aria-describedby` del campo: el error si hay, si no la ayuda. */
const describedBy = (
  id: string,
  error: string | undefined,
  hint: string | undefined,
): string | undefined =>
  error !== undefined ? `${id}-error` : hint !== undefined ? `${id}-hint` : undefined;

export function FieldMessage({
  id,
  error,
  hint,
}: {
  id: string;
  error: string | undefined;
  hint?: string | undefined;
}) {
  if (error !== undefined) {
    return (
      <p id={`${id}-error`} className="text-body-sm text-destructive">
        {error}
      </p>
    );
  }
  if (hint === undefined) return null;
  return (
    <p id={`${id}-hint`} className="text-body-sm text-secondary">
      {hint}
    </p>
  );
}

export default function CheckoutTextField({
  id,
  label,
  input,
  hint,
  value,
  error,
  onChange,
}: CheckoutTextFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-label-md text-on-surface">
        {label}
      </label>
      <input
        id={id}
        type={input.type ?? 'text'}
        inputMode={input.inputMode}
        autoComplete={input.autoComplete}
        value={value}
        aria-invalid={error !== undefined}
        aria-describedby={describedBy(id, error, hint)}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        className={cn(CHECKOUT_INPUT_CLASS, error !== undefined && 'ring-2 ring-destructive')}
      />
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}
