// Lo que ve el comprador de un pedido con Mercado Pago según `mercadoPagoView`
// (textos del plan de la etapa 3 del ERP §4 y §9 y de la etapa 4 §6).
import { getWhatsAppNumber } from '@/lib/env';
import type { MercadoPagoView } from './mercadoPagoUtils';
import SwitchToTransferButton from './SwitchToTransferButton';

const LINK_CLASS =
  'inline-flex min-h-11 items-center rounded text-label-lg font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';
const BUTTON_CLASS =
  'inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 py-2 text-label-lg font-bold text-on-primary shadow-sm transition hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

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
  return <p className="text-body-md text-on-surface">{children}</p>;
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
        <p role="status" className="text-body-md text-on-surface">
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
      // El "gracias" y el aviso por email van en la cabecera de la página.
      return <Message>Pago aprobado.</Message>;
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
