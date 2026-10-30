// "Pagar por transferencia" en un pedido de Mercado Pago que no se pudo pagar:
// crea un pedido nuevo por transferencia con los mismos datos y una clave de
// intento nueva (el de MP vence solo, plan de la etapa 3 del ERP §4). Sin los
// datos guardados en la pestaña no se ofrece: queda WhatsApp.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { describeOrderError } from './checkoutUtils';
import { forgetOrderDraft, loadOrderDraft } from './orderDraftStorage';
import { useCreateOrder } from './useCreateOrder';

export default function SwitchToTransferButton({ token }: { token: string }) {
  const navigate = useNavigate();
  const { state, submit } = useCreateOrder();
  const [draft] = useState(() => loadOrderDraft(token));

  if (draft === null) return null;

  const handleClick = async () => {
    const result = await submit({ ...draft, paymentMethod: 'transfer' });
    if ('order' in result) {
      forgetOrderDraft(token);
      void navigate(`/pedido/${result.order.token}`);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={state.status === 'submitting'}
        className="inline-flex min-h-11 items-center justify-center rounded-md border border-primary px-6 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {state.status === 'submitting' ? 'Creando el pedido…' : 'Pagar por transferencia'}
      </button>
      {state.status === 'failed' && (
        <p role="alert" className="text-sm text-destructive">
          {describeOrderError(state.error)}
        </p>
      )}
    </div>
  );
}
