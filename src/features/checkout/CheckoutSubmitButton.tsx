// Botón que confirma el pedido en `/checkout`. Dice qué va a pasar con el medio
// elegido y se apaga mientras se manda o mientras falta cotizar el envío (la
// tarjeta "Entrega" explica por qué).
import Icon from '@/components/ui/Icon';
import type { PaymentMethod } from './ordersApi';

const SUBMIT_LABEL: Record<PaymentMethod, string> = {
  transfer: 'Confirmar pedido',
  mercado_pago: 'Confirmar y pagar con Mercado Pago',
};

interface CheckoutSubmitButtonProps {
  paymentMethod: PaymentMethod;
  submitting: boolean;
  disabled: boolean;
}

export default function CheckoutSubmitButton({
  paymentMethod,
  submitting,
  disabled,
}: CheckoutSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={submitting || disabled}
      className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-label-lg font-bold text-on-primary shadow-md transition-all hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon name="lock" className="h-5 w-5" />
      {submitting ? 'Enviando…' : SUBMIT_LABEL[paymentMethod]}
    </button>
  );
}
