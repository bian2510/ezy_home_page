// OrderPage — `/pedido/:token`: el pedido recién creado (o vuelto a abrir).
// Por transferencia, los datos para transferir; con Mercado Pago, el estado
// del pago (`MercadoPagoStatus`), nunca la cuenta para transferir. Lee el
// pedido del ERP por su token; el ERP nunca devuelve los datos del comprador.
//
// Rediseño (2026-11, mock de la confirmación): tarjeta centrada con la
// cabecera del estado (`orderHero`), retiro y medio de pago, la cuenta para
// transferir, los productos, el consejo de Smart Life y la vuelta al catálogo.
// Solo cambió la presentación: el estado, la consulta y Mercado Pago siguen
// igual (`useOrder`, `mercadoPagoView`, `MercadoPagoStatus`).

const CARD =
  'mx-auto flex w-full max-w-card flex-col rounded-xl bg-surface-container-lowest px-4 py-8 shadow-md sm:p-6 md:p-10';
const LINK =
  'inline-flex min-h-11 items-center rounded text-label-lg font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';
import { useCallback } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import Icon from '@/components/ui/Icon';
import { getWhatsAppNumber } from '@/lib/env';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import MercadoPagoStatus from './MercadoPagoStatus';
import OrderHero from './OrderHero';
import { PaymentCard, PickupCard } from './OrderInfoCards';
import OrderItems from './OrderItems';
import OrderLayout from './OrderLayout';
import SmartHomeTip from './SmartHomeTip';
import TransferDetails from './TransferDetails';
import {
  orderHero,
  showsSmartHomeTip,
  statusOffersWhatsApp,
  transferStatusLabel,
} from './orderViewUtils';
import { mercadoPagoPollPlan, parseMpResult } from './mercadoPagoUtils';
import type { StoreOrder } from './ordersApi';
import { useOrder } from './useOrder';

/**
 * Estado del pago por transferencia en "Medio de pago": "Pago aprobado" o
 * "Esperando la transferencia"; vencido o cancelado, el mensaje de siempre.
 */
function TransferStatus({ order }: { order: StoreOrder }) {
  const label = transferStatusLabel(order);
  if (label !== null) {
    return <p className="text-body-sm font-semibold text-primary">{label}</p>;
  }
  return (
    <p className="text-body-md text-on-surface">
      {order.status === 'expired'
        ? 'Este pedido venció porque no recibimos la transferencia a tiempo. Si ya transferiste, escribinos por WhatsApp.'
        : 'Este pedido fue cancelado.'}
    </p>
  );
}

export default function OrderPage() {
  const { token = '' } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const result = parseMpResult(searchParams.get('resultado'));
  const openOnArrival = isOpenMercadoPagoState(location.state);
  const pollPlanFor = useCallback(
    (order: StoreOrder) => mercadoPagoPollPlan(order, result),
    [result],
  );
  const state = useOrder(token, pollPlanFor);

  useDocumentMeta({
    title: 'Tu pedido',
    description: 'Estado de tu pedido en EzyHome.',
    path: `/pedido/${token}`,
    noIndex: true,
  });

  if (state.status === 'loading') {
    return (
      <OrderLayout>
        <p role="status" className="py-16 text-center text-secondary">
          Cargando tu pedido…
        </p>
      </OrderLayout>
    );
  }

  if (state.status !== 'ready') {
    return (
      <OrderLayout>
        <div className={`${CARD} items-center gap-4 text-center`}>
          <p className="text-body-lg text-on-surface">
            {state.status === 'not_found'
              ? 'No encontramos este pedido.'
              : 'No pudimos cargar tu pedido. Probá de nuevo en un rato.'}
          </p>
          <a
            href={`https://wa.me/${getWhatsAppNumber()}`}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK}
          >
            Escribinos por WhatsApp
          </a>
        </div>
      </OrderLayout>
    );
  }

  const { order } = state;
  const whatsAppNumber = getWhatsAppNumber();
  const offersHelp = whatsAppNumber !== '' && !statusOffersWhatsApp(order, result, state.timedOut);
  const pendingTransfer = order.paymentMethod === 'transfer' && order.status === 'pending_payment';

  return (
    <OrderLayout>
      <div className={`${CARD} gap-8`}>
        <OrderHero hero={orderHero(order)} />

        <div className="flex w-full flex-col gap-4 rounded-xl bg-surface-container-low p-2 text-left sm:p-4 md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PickupCard order={order} />
            <PaymentCard order={order}>
              {order.paymentMethod === 'mercado_pago' ? (
                <MercadoPagoStatus
                  order={order}
                  result={result}
                  timedOut={state.timedOut}
                  openOnArrival={openOnArrival}
                />
              ) : (
                <TransferStatus order={order} />
              )}
            </PaymentCard>
          </div>
          {pendingTransfer && <TransferDetails order={order} />}
          <OrderItems order={order} />
        </div>

        {showsSmartHomeTip(order) && <SmartHomeTip />}

        <div className="flex w-full flex-col items-center gap-3">
          <Link
            to="/catalogo"
            className="inline-flex min-h-12 w-full max-w-md items-center justify-center gap-2 rounded-lg bg-primary px-6 text-label-lg font-bold text-on-primary shadow-md transition-all hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Icon name="store" />
            Seguir explorando productos
          </Link>
          {offersHelp && (
            <p className="text-body-sm text-on-surface-variant">
              ¿Tenés preguntas sobre tu pedido?{' '}
              <a
                href={`https://wa.me/${whatsAppNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK}
              >
                Escribinos por WhatsApp
              </a>
            </p>
          )}
        </div>
      </div>
    </OrderLayout>
  );
}

/** El checkout llega con `{ openMercadoPago: true }` para abrir MP apenas esté el link. */
const isOpenMercadoPagoState = (state: unknown): boolean =>
  typeof state === 'object' &&
  state !== null &&
  (state as { openMercadoPago?: unknown }).openMercadoPago === true;
