// Datos del comprador en `/checkout`: nombre, WhatsApp, email, DNI y la
// aceptación del aviso de privacidad (Ley 25.326, ADR-006).
import CheckoutTextField from './CheckoutTextField';
import {
  PHONE_HINT,
  phoneDigits,
  type BuyerErrors,
  type BuyerField,
  type BuyerForm,
} from './checkoutUtils';

// Por qué la pestaña guarda el pedido de Mercado Pago (`orderDraftStorage.ts`).
const DRAFT_NOTICE =
  'Si pagás con Mercado Pago, guardamos tu nombre, WhatsApp, email, DNI, los productos del ' +
  'pedido y, con envío a domicilio, tu dirección en esta pestaña del navegador, para que ' +
  'puedas pasar de Mercado Pago a transferencia sin volver a cargarlos. Quedan ahí hasta que ' +
  'cerrás la pestaña o se cierra el pedido, y no los mandamos a ningún otro lado.';

interface BuyerFieldsProps {
  form: BuyerForm;
  errors: BuyerErrors;
  onChange: (field: BuyerField, value: string | boolean) => void;
}

export default function BuyerFields({ form, errors, onChange }: BuyerFieldsProps) {
  return (
    <>
      <CheckoutTextField
        id="checkout-name"
        label="Nombre y apellido"
        input={{ autoComplete: 'name' }}
        value={form.name}
        error={errors.name}
        onChange={(value) => onChange('name', value)}
      />
      <CheckoutTextField
        id="checkout-phone"
        label="Teléfono (WhatsApp)"
        input={{ type: 'tel', inputMode: 'numeric', autoComplete: 'tel-national' }}
        hint={PHONE_HINT}
        value={form.phone}
        error={errors.phone}
        onChange={(value) => onChange('phone', phoneDigits(value))}
      />
      <CheckoutTextField
        id="checkout-email"
        label="Email"
        input={{ type: 'email', autoComplete: 'email' }}
        value={form.email}
        error={errors.email}
        onChange={(value) => onChange('email', value)}
      />
      <CheckoutTextField
        id="checkout-document"
        label="DNI"
        input={{ autoComplete: 'off' }}
        value={form.document}
        error={errors.document}
        onChange={(value) => onChange('document', value)}
      />

      {/* Ocupa las dos columnas de la tarjeta "Información de contacto". */}
      <div className="flex flex-col gap-1 rounded-xl bg-surface-container-low p-4 md:col-span-2">
        <label className="flex items-start gap-2 text-body-md text-on-surface">
          <input
            type="checkbox"
            checked={form.acceptedPrivacy}
            onChange={(event) => onChange('acceptedPrivacy', event.target.checked)}
            className="mt-1 h-4 w-4 accent-primary"
          />
          <span>Acepto que EzyHome use mis datos para gestionar este pedido.</span>
        </label>
        <p className="text-body-sm text-secondary">
          Usamos tu nombre, WhatsApp, email y DNI (y tu dirección, si pedís envío a domicilio) solo
          para este pedido: para avisarte de su estado, hacer la factura si la pedís, saber quién
          retira o mandarte el envío. Podés pedir verlos, corregirlos o borrarlos escribiéndonos por
          WhatsApp (Ley 25.326 de Protección de Datos Personales). La Agencia de Acceso a la
          Información Pública es el órgano de control.
          {` ${DRAFT_NOTICE}`}
        </p>
        {errors.acceptedPrivacy !== undefined && (
          <p className="text-body-sm text-destructive">{errors.acceptedPrivacy}</p>
        )}
      </div>
    </>
  );
}
