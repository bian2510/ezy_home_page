// Reglas puras de la página de un pedido con Mercado Pago (plan de la etapa 3
// del ERP §4 y §9; etapa 4 §6). Sin React ni red: qué consultar y qué mostrar
// según el pedido del ERP y lo que dijo Mercado Pago al volver.
import type { StoreOrder } from './ordersApi';

/** Lo que Mercado Pago pone en la vuelta: `/pedido/:token?resultado=…`. */
export type MpResult = 'ok' | 'error' | 'pendiente';

/** Cada cuánto consultar el pedido y cuántas veces, después de la primera. */
export interface PollPlan {
  intervalMs: number;
  maxPolls: number;
}

/** Esperando el link de pago: cada 1 s hasta 15 s (plan etapa 3 §4). */
export const OPENING_POLL: PollPlan = { intervalMs: 1000, maxPolls: 15 };

/** Esperando que el aviso de MP marque el pedido pagado: cada 2 s hasta 30 s. */
export const CONFIRMING_POLL: PollPlan = { intervalMs: 2000, maxPolls: 15 };

export type MercadoPagoView =
  | { kind: 'opening' }
  | { kind: 'open_failed' }
  | { kind: 'pay'; url: string }
  | { kind: 'confirming' }
  | { kind: 'confirm_pending' }
  | { kind: 'payment_failed'; retryUrl: string | null }
  | { kind: 'payment_pending' }
  | { kind: 'paid' }
  | { kind: 'expired' }
  | { kind: 'canceled' };

const RESULTS: readonly MpResult[] = ['ok', 'error', 'pendiente'];

/** `?resultado=` de la URL; cualquier otro valor cuenta como que no volvió de MP. */
export const parseMpResult = (value: string | null): MpResult | null =>
  RESULTS.find((result) => result === value) ?? null;

/**
 * Si hay que seguir consultando el pedido y cómo. Solo un pedido de MP
 * pendiente: sin link (todavía lo crea el ERP) o de vuelta con `ok` (falta el
 * aviso de MP). `null` corta la consulta.
 */
export const mercadoPagoPollPlan = (
  order: StoreOrder,
  result: MpResult | null,
): PollPlan | null => {
  if (order.paymentMethod !== 'mercado_pago' || order.status !== 'pending_payment') return null;
  if (result === 'ok') return CONFIRMING_POLL;
  if (result !== null || order.checkoutUrl !== null || order.checkoutError) return null;
  return OPENING_POLL;
};

const isPastDeadline = (expiresAt: string | null, now: Date): boolean => {
  if (expiresAt === null) return false;
  const deadline = new Date(expiresAt).getTime();
  return !Number.isNaN(deadline) && deadline <= now.getTime();
};

/**
 * Qué ve el comprador. Manda el estado del ERP (pagado, vencido, cancelado);
 * mientras está pendiente, lo que dijo MP al volver y si el link sirve todavía.
 * `timedOut`: se terminó la consulta sin cambios.
 */
export const mercadoPagoView = (
  order: StoreOrder,
  result: MpResult | null,
  timedOut: boolean,
  now: Date = new Date(),
): MercadoPagoView => {
  if (order.status !== 'pending_payment') return { kind: order.status };

  const usableUrl = isPastDeadline(order.expiresAt, now) ? null : order.checkoutUrl;
  switch (result) {
    case 'ok':
      return { kind: timedOut ? 'confirm_pending' : 'confirming' };
    case 'pendiente':
      return { kind: 'payment_pending' };
    case 'error':
      return { kind: 'payment_failed', retryUrl: usableUrl };
    case null:
      if (usableUrl !== null) return { kind: 'pay', url: usableUrl };
      if (order.checkoutError || order.checkoutUrl !== null || timedOut) {
        return { kind: 'open_failed' };
      }
      return { kind: 'opening' };
  }
};
