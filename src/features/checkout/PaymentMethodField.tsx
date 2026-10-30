// Elección del medio de pago en `/checkout`, cada uno con su total (los precios
// del ERP: con Mercado Pago lleva el recargo). Solo se muestra con
// `VITE_MERCADOPAGO_ENABLED=true`; si no, el checkout es solo transferencia.
import { formatPrice } from '@/lib/formatPrice';
import type { PaymentMethod } from './ordersApi';

interface PaymentMethodFieldProps {
  value: PaymentMethod;
  totals: Record<PaymentMethod, number>;
  onChange: (method: PaymentMethod) => void;
}

const OPTIONS: { method: PaymentMethod; label: string }[] = [
  { method: 'transfer', label: 'Transferencia bancaria' },
  { method: 'mercado_pago', label: 'Mercado Pago' },
];

export default function PaymentMethodField({ value, totals, onChange }: PaymentMethodFieldProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-medium text-foreground">Medio de pago</legend>
      {OPTIONS.map(({ method, label }) => (
        <label
          key={method}
          className="flex min-h-11 items-center gap-3 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground has-[:checked]:border-primary"
        >
          <input
            type="radio"
            name="payment-method"
            value={method}
            checked={value === method}
            onChange={() => onChange(method)}
            className="h-4 w-4"
          />
          <span className="flex-1">{label}</span>
          <span className="font-mono">{formatPrice(totals[method])}</span>
        </label>
      ))}
    </fieldset>
  );
}
