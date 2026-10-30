// Datos del comprador en `/checkout`: nombre, WhatsApp, email, DNI y la
// aceptación del aviso de privacidad (Ley 25.326, ADR-006).
import type { ChangeEvent, HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import {
  PHONE_HINT,
  phoneDigits,
  type BuyerErrors,
  type BuyerField,
  type BuyerForm,
} from './checkoutUtils';

const INPUT_CLASS =
  'min-h-11 w-full rounded-md border border-border bg-card px-3 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

interface TextFieldProps {
  field: Exclude<BuyerField, 'acceptedPrivacy'>;
  label: string;
  type?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete: string;
  /** Ayuda fija bajo el campo; el error la reemplaza. */
  hint?: string;
  value: string;
  error: string | undefined;
  onChange: (field: BuyerField, value: string) => void;
}

function TextField({
  field,
  label,
  type = 'text',
  inputMode,
  autoComplete,
  hint,
  value,
  error,
  onChange,
}: TextFieldProps) {
  const id = `checkout-${field}`;
  const describedBy =
    error !== undefined ? `${id}-error` : hint !== undefined ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        aria-invalid={error !== undefined}
        aria-describedby={describedBy}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(field, event.target.value)}
        className={cn(INPUT_CLASS, error !== undefined && 'border-destructive')}
      />
      {error !== undefined && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
      {error === undefined && hint !== undefined && (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

// Por qué la pestaña guarda el pedido de Mercado Pago (`orderDraftStorage.ts`).
const DRAFT_NOTICE =
  'Si pagás con Mercado Pago, guardamos tu nombre, WhatsApp, email, DNI y los productos del ' +
  'pedido en esta pestaña del navegador, para que puedas pasar de Mercado Pago a transferencia ' +
  'sin volver a cargarlos. Quedan ahí hasta que cerrás la pestaña o se cierra el pedido, y no ' +
  'los mandamos a ningún otro lado.';

interface BuyerFieldsProps {
  form: BuyerForm;
  /** Con Mercado Pago el aviso cuenta qué guarda la pestaña. */
  mercadoPagoEnabled: boolean;
  errors: BuyerErrors;
  onChange: (field: BuyerField, value: string | boolean) => void;
}

export default function BuyerFields({
  form,
  mercadoPagoEnabled,
  errors,
  onChange,
}: BuyerFieldsProps) {
  return (
    <>
      <TextField
        field="name"
        label="Nombre y apellido"
        autoComplete="name"
        value={form.name}
        error={errors.name}
        onChange={onChange}
      />
      <TextField
        field="phone"
        label="WhatsApp"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        hint={PHONE_HINT}
        value={form.phone}
        error={errors.phone}
        onChange={(field, value) => onChange(field, phoneDigits(value))}
      />
      <TextField
        field="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={form.email}
        error={errors.email}
        onChange={onChange}
      />
      <TextField
        field="document"
        label="DNI"
        autoComplete="off"
        value={form.document}
        error={errors.document}
        onChange={onChange}
      />

      <div className="flex flex-col gap-1 rounded-md border border-border bg-muted/40 p-3">
        <label className="flex items-start gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.acceptedPrivacy}
            onChange={(event) => onChange('acceptedPrivacy', event.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span>Acepto que EzyHome use mis datos para gestionar este pedido.</span>
        </label>
        <p className="text-xs text-muted-foreground">
          Usamos tu nombre, WhatsApp, email y DNI solo para este pedido: para avisarte de su estado,
          hacer la factura si la pedís y saber quién retira. Podés pedir verlos, corregirlos o
          borrarlos escribiéndonos por WhatsApp (Ley 25.326 de Protección de Datos Personales). La
          Agencia de Acceso a la Información Pública es el órgano de control.
          {mercadoPagoEnabled && ` ${DRAFT_NOTICE}`}
        </p>
        {errors.acceptedPrivacy !== undefined && (
          <p className="text-sm text-destructive">{errors.acceptedPrivacy}</p>
        )}
      </div>
    </>
  );
}
