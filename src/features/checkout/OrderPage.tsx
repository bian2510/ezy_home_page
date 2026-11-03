// OrderPage — `/pedido/:token`: el pedido recién creado (o vuelto a abrir).
// Por transferencia, los datos para transferir; con Mercado Pago, el estado
// del pago (`MercadoPagoStatus`), nunca la cuenta para transferir. Lee el
// pedido del ERP por su token; el ERP nunca devuelve los datos del comprador.
import { useCallback } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { formatPrice } from '@/lib/formatPrice';
import { getWhatsAppNumber } from '@/lib/env';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { formatDeadline } from './checkoutUtils';
import MercadoPagoStatus from './MercadoPagoStatus';
import OrderLayout from './OrderLayout';
import { mercadoPagoPollPlan, parseMpResult } from './mercadoPagoUtils';
import type { StoreOrder } from './ordersApi';
import { useOrder } from './useOrder';

function TransferDetails({ order }: { order: StoreOrder }) {
  const { alias, cbu, holder, bank } = order.transfer;
  const rows: [string, string | null][] = [
    ['Alias', alias],
    ['CBU/CVU', cbu],
    ['Titular', holder],
    ['Banco', bank],
  ];
  const deadline = formatDeadline(order.expiresAt);

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-surface-container-low p-4">
      <h2 className="text-headline-sm font-bold text-on-surface">Transferí a esta cuenta</h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        {rows
          .filter((row): row is [string, string] => row[1] !== null)
          .map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="break-all font-mono text-foreground">{value}</dd>
            </div>
          ))}
      </dl>
      <p className="text-sm text-foreground">
        En el concepto poné &quot;Pedido {order.number}&quot;.
      </p>
      {deadline !== null && (
        <p className="text-sm text-muted-foreground">
          Transferí antes del {deadline} (hora de Argentina). Si no, el pedido vence.
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        Te avisamos por email cuando acreditemos el pago.
      </p>
    </div>
  );
}

function StatusMessage({ order }: { order: StoreOrder }) {
  switch (order.status) {
    case 'pending_payment':
      return <TransferDetails order={order} />;
    case 'paid':
      return (
        <p className="text-base text-foreground">Recibimos tu pago. ¡Gracias por tu compra!</p>
      );
    case 'expired':
      return (
        <p className="text-base text-foreground">
          Este pedido venció porque no recibimos la transferencia a tiempo. Si ya transferiste,
          escribinos por WhatsApp.
        </p>
      );
    case 'canceled':
      return <p className="text-base text-foreground">Este pedido fue cancelado.</p>;
  }
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
        <p role="status" className="py-16 text-center text-muted-foreground">
          Cargando tu pedido…
        </p>
      </OrderLayout>
    );
  }

  if (state.status !== 'ready') {
    return (
      <OrderLayout>
        <div className="flex flex-col items-start gap-4">
          <p className="text-base text-foreground">
            {state.status === 'not_found'
              ? 'No encontramos este pedido.'
              : 'No pudimos cargar tu pedido. Probá de nuevo en un rato.'}
          </p>
          <a
            href={`https://wa.me/${getWhatsAppNumber()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Escribinos por WhatsApp
          </a>
        </div>
      </OrderLayout>
    );
  }

  const { order } = state;
  return (
    <OrderLayout>
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm md:p-8">
          <h1 className="text-headline-xl-mobile font-extrabold text-on-surface">
            Pedido N.º {order.number}
          </h1>
          <ul className="flex flex-col gap-1 text-sm text-foreground">
            {order.items.map((item) => (
              <li key={item.sku}>
                {item.quantity} × {item.name}
              </li>
            ))}
          </ul>
          <p data-testid="order-total" className="text-label-lg font-bold text-on-surface">
            Total:{' '}
            <span className="text-headline-md font-extrabold tabular-nums text-primary">
              {formatPrice(order.total)}
            </span>
          </p>
          {order.paymentMethod === 'mercado_pago' ? (
            <MercadoPagoStatus
              order={order}
              result={result}
              timedOut={state.timedOut}
              openOnArrival={openOnArrival}
            />
          ) : (
            <StatusMessage order={order} />
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
          <h2 className="text-headline-sm font-bold text-on-surface">Retiro en el local</h2>
          {order.pickup.address !== null && (
            <p className="text-sm text-foreground">{order.pickup.address}</p>
          )}
          {order.pickup.hours !== null && (
            <p className="text-sm text-muted-foreground">{order.pickup.hours}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Traé el número de pedido. Guardá esta página para volver a verla.
          </p>
          <Link
            to="/catalogo"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Seguir mirando productos
          </Link>
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
