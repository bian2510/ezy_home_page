// Estado de un pedido con Mercado Pago en `/pedido/:token`: abriendo MP, link
// para pagar, vuelta de MP (`?resultado=ok|error|pendiente`) y pedido cerrado.
// Nunca muestra los datos para transferir: el pedido se paga en MP.
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { goToExternalUrl } from '@/lib/redirect';
import MercadoPagoMessage from './MercadoPagoMessage';
import { mercadoPagoView, type MpResult } from './mercadoPagoUtils';
import { forgetOrderDraft } from './orderDraftStorage';
import type { StoreOrder } from './ordersApi';

interface MercadoPagoStatusProps {
  order: StoreOrder;
  result: MpResult | null;
  timedOut: boolean;
  /** Viene del checkout: al llegar el link se abre MP sin tocar nada. */
  openOnArrival: boolean;
}

export default function MercadoPagoStatus({
  order,
  result,
  timedOut,
  openOnArrival,
}: MercadoPagoStatusProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const view = mercadoPagoView(order, result, timedOut);
  const redirectUrl = openOnArrival && view.kind === 'pay' ? view.url : null;
  const closed = order.status !== 'pending_payment';

  useEffect(() => {
    if (redirectUrl === null) return;
    // Sin la marca del checkout: al volver con "atrás" se ve "Ir a pagar" en
    // vez de abrir MP otra vez.
    void navigate(
      { pathname: location.pathname, search: location.search },
      { replace: true, state: null },
    );
    goToExternalUrl(redirectUrl);
  }, [redirectUrl, navigate, location.pathname, location.search]);

  useEffect(() => {
    if (closed) forgetOrderDraft(order.token);
  }, [closed, order.token]);

  return (
    <div className="flex flex-col items-start gap-3">
      <MercadoPagoMessage
        view={redirectUrl === null ? view : { kind: 'opening' }}
        token={order.token}
      />
    </div>
  );
}
