// Medio de pago en `/checkout`, cada uno con su total (los precios del ERP: con
// Mercado Pago lleva el recargo). Con `VITE_MERCADOPAGO_ENABLED=true` se elige
// entre los dos; si no, el único medio es la transferencia y se muestra como
// dato, sin opciones.
//
// La transferencia lleva el descuento real de los totales ("-5%"), que no
// aparece si no hay descuento. Sin "Efectivo" ni promesas de aprobación
// instantánea (usuario, 2026-11-03).
import { formatPrice } from '@/lib/formatPrice';
import { cn } from '@/lib/cn';
import { totalsDiscountPercent } from './checkoutUtils';
import type { PaymentMethod } from './ordersApi';

interface PaymentMethodFieldProps {
  mercadoPagoEnabled: boolean;
  value: PaymentMethod;
  totals: Record<PaymentMethod, number>;
  onChange: (method: PaymentMethod) => void;
}

const TITLE: Record<PaymentMethod, string> = {
  mercado_pago: 'Mercado Pago',
  transfer: 'Transferencia bancaria',
};

const DETAIL: Record<PaymentMethod, string> = {
  mercado_pago: 'Tarjetas, dinero en cuenta y más',
  transfer:
    'Al confirmar ves los datos de la cuenta. Te avisamos por email cuando acreditemos el pago.',
};

// Mercado Pago primero, como el mock; la transferencia sigue elegida por defecto.
const METHODS: readonly PaymentMethod[] = ['mercado_pago', 'transfer'];

interface MethodTextProps {
  method: PaymentMethod;
  discount: number | null;
  /** Ids del título y del detalle: el radio se nombra con el título y se describe con el resto. */
  ids?: { title: string; detail: string };
}

function MethodText({ method, discount, ids }: MethodTextProps) {
  return (
    <span className="flex flex-1 flex-col gap-1">
      {/* El cartel va dentro del título: el radio se llama "Transferencia bancaria -5%". */}
      <span id={ids?.title} className="text-label-lg font-bold text-on-surface">
        {TITLE[method]}
        {discount !== null && (
          <span className="ml-2 inline-block rounded-full bg-tertiary-container px-2 py-0.5 align-middle text-label-sm font-bold text-on-tertiary">
            {`-${discount}%`}
          </span>
        )}
      </span>
      <span id={ids?.detail} className="text-body-sm text-secondary">
        {DETAIL[method]}
      </span>
    </span>
  );
}

export default function PaymentMethodField({
  mercadoPagoEnabled,
  value,
  totals,
  onChange,
}: PaymentMethodFieldProps) {
  if (!mercadoPagoEnabled) {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-primary/10 p-4">
        <MethodText method="transfer" discount={null} />
      </div>
    );
  }

  const discount = totalsDiscountPercent(totals);

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="sr-only">Medio de pago</legend>
      {METHODS.map((method) => (
        <label
          key={method}
          className={cn(
            'flex min-h-11 cursor-pointer items-start gap-3 rounded-xl p-4 transition-colors',
            'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary',
            value === method
              ? 'bg-primary/10 shadow-sm'
              : 'bg-surface-container-low hover:bg-surface-container',
          )}
        >
          <input
            type="radio"
            name="payment-method"
            value={method}
            checked={value === method}
            onChange={() => onChange(method)}
            aria-labelledby={`pago-${method}-titulo`}
            aria-describedby={`pago-${method}-detalle pago-${method}-total`}
            className="mt-1 h-4 w-4 accent-primary"
          />
          <MethodText
            method={method}
            discount={method === 'transfer' ? discount : null}
            ids={{ title: `pago-${method}-titulo`, detail: `pago-${method}-detalle` }}
          />
          <span
            id={`pago-${method}-total`}
            className="text-label-lg font-bold tabular-nums text-on-surface"
          >
            {formatPrice(totals[method])}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
