// Reglas puras de presentación de la página del pedido: qué titular lleva cada
// estado, cómo se nombra el medio de pago y qué se muestra alrededor. No
// deciden nada del pedido: el estado lo deriva el ERP y `mercadoPagoView`.
import { mercadoPagoView, type MpResult } from './mercadoPagoUtils';
import type { PaymentMethod, StoreOrder } from './ordersApi';

/** `confirmed`: tilde; `received`: pendiente (reloj); `closed`: vencido o cancelado. */
export type OrderHeroTone = 'confirmed' | 'received' | 'closed';

export interface OrderHero {
  tone: OrderHeroTone;
  eyebrow: string;
  title: string;
  /** Bajada; `null` cuando el mensaje del estado ya lo explica. */
  body: string | null;
}

/**
 * Titular de la confirmación (usuario, 2026-11-03). Solo un pedido pagado es
 * "confirmado": uno que espera el pago es "recibido". No se muestra el email
 * del comprador: la API del pedido no lo devuelve.
 */
export const orderHero = (order: StoreOrder): OrderHero => {
  const number = `#${order.number}`;
  switch (order.status) {
    case 'paid':
      return {
        tone: 'confirmed',
        eyebrow: 'Pedido confirmado',
        title: '¡Gracias por tu compra!',
        body: `Tu pedido ${number} está confirmado. Te mandamos el detalle por email.`,
      };
    case 'pending_payment':
      return {
        tone: 'received',
        eyebrow: 'Pedido recibido',
        title: '¡Recibimos tu pedido!',
        body:
          order.paymentMethod === 'mercado_pago'
            ? `Tu pedido ${number} queda confirmado cuando Mercado Pago apruebe el pago.`
            : `Tu pedido ${number} queda confirmado cuando acreditemos la transferencia.`,
      };
    case 'expired':
      return {
        tone: 'closed',
        eyebrow: 'Pedido vencido',
        title: 'No se completó el pago',
        body: null,
      };
    case 'canceled':
      return {
        tone: 'closed',
        eyebrow: 'Pedido cancelado',
        title: 'Este pedido ya no está activo',
        body: null,
      };
  }
};

const METHOD_LABEL: Record<PaymentMethod, string> = {
  mercado_pago: 'Mercado Pago',
  transfer: 'Transferencia bancaria',
};

export const paymentMethodLabel = (method: PaymentMethod): string => METHOD_LABEL[method];

/**
 * Estado del pago por transferencia en la tarjeta "Medio de pago". "Pago
 * aprobado" solo si está pagado. Vencido o cancelado: `null`, lo cuenta el
 * mensaje del estado de siempre. (Con Mercado Pago lo cuenta `MercadoPagoStatus`.)
 */
export const transferStatusLabel = (order: StoreOrder): string | null => {
  if (order.status === 'paid') return 'Pago aprobado';
  if (order.status === 'pending_payment') return 'Esperando la transferencia';
  return null;
};

/** El consejo de Smart Life / Tuya Smart: solo para un pedido vivo (pagado o por pagar). */
export const showsSmartHomeTip = (order: StoreOrder): boolean =>
  order.status === 'paid' || order.status === 'pending_payment';

const MP_VIEWS_WITH_WHATSAPP = new Set(['open_failed', 'payment_failed', 'expired']);

/**
 * `true` si el mensaje de Mercado Pago ya ofrece escribir por WhatsApp: la
 * página no repite el link al pie. Usa la misma vista que muestra
 * `MercadoPagoStatus` (`mercadoPagoView`), sin cambiarla.
 */
export const statusOffersWhatsApp = (
  order: StoreOrder,
  result: MpResult | null,
  timedOut: boolean,
): boolean =>
  order.paymentMethod === 'mercado_pago' &&
  MP_VIEWS_WITH_WHATSAPP.has(mercadoPagoView(order, result, timedOut).kind);
