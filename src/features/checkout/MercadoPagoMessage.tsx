// Lo que ve el comprador de un pedido con Mercado Pago según `mercadoPagoView`
// (textos del plan de la etapa 3 del ERP §4 y §9 y de la etapa 4 §6).
import { getWhatsAppNumber } from '@/lib/env';
import type { MercadoPagoView } from './mercadoPagoUtils';
import SwitchToTransferButton from './SwitchToTransferButton';

const LINK_CLASS = 'text-sm font-medium text-primary underline-offset-4 hover:underline';
const BUTTON_CLASS =
  'inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

function WhatsAppLink() {
  return (
    <a
      href={`https://wa.me/${getWhatsAppNumber()}`}
      target="_blank"
      rel="noopener noreferrer"
      className={LINK_CLASS}
    >
      Escribinos por WhatsApp
    </a>
  );
}

function Message({ children }: { children: string }) {
  return <p className="text-base text-foreground">{children}</p>;
}

export default function MercadoPagoMessage({
  view,
  token,
}: {
  view: MercadoPagoView;
  token: string;
}) {
  switch (view.kind) {
    case 'opening':
    case 'confirming':
      return (
        <p role="status" className="text-base text-foreground">
          {view.kind === 'opening'
            ? 'Abriendo Mercado Pago…'
            : 'Recibimos tu pago. Lo estamos confirmando con Mercado Pago…'}
        </p>
      );
    case 'open_failed':
    case 'payment_failed':
      return (
        <>
          <Message>
            {view.kind === 'open_failed'
              ? 'No pudimos abrir Mercado Pago. Podés pagar por transferencia o escribirnos por WhatsApp.'
              : 'El pago no se completó. Podés probar de nuevo, pagar por transferencia o escribirnos por WhatsApp.'}
          </Message>
          {view.kind === 'payment_failed' && view.retryUrl !== null && (
            <a href={view.retryUrl} className={BUTTON_CLASS}>
              Probar de nuevo con Mercado Pago
            </a>
          )}
          <SwitchToTransferButton token={token} />
          <WhatsAppLink />
        </>
      );
    case 'pay':
      return (
        <>
          <Message>Tu pedido está esperando el pago con Mercado Pago.</Message>
          <a href={view.url} className={BUTTON_CLASS}>
            Ir a pagar
          </a>
        </>
      );
    case 'confirm_pending':
      return (
        <Message>Estamos confirmando tu pago con Mercado Pago. Te avisamos por email.</Message>
      );
    case 'payment_pending':
      return (
        <Message>
          Tu pago está pendiente. Cuando Mercado Pago lo apruebe te avisamos por email.
        </Message>
      );
    case 'paid':
      return <Message>Pago confirmado. Te avisamos por email y WhatsApp para el retiro.</Message>;
    case 'expired':
      return (
        <>
          <Message>
            Este pedido venció porque no se completó el pago. Si ya pagaste, escribinos por
            WhatsApp.
          </Message>
          <WhatsAppLink />
        </>
      );
    case 'canceled':
      return <Message>Este pedido fue cancelado.</Message>;
  }
}
