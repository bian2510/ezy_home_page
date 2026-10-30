import { describe, expect, it } from 'vitest';
import {
  CONFIRMING_POLL,
  OPENING_POLL,
  mercadoPagoPollPlan,
  mercadoPagoView,
  parseMpResult,
} from '@/features/checkout/mercadoPagoUtils';
import type { StoreOrder } from '@/features/checkout/ordersApi';

const NOW = new Date('2026-10-30T12:00:00Z');
const CHECKOUT_URL = 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=1';

const buildOrder = (overrides: Partial<StoreOrder> = {}): StoreOrder => ({
  token: 'tok-mp',
  number: 8,
  status: 'pending_payment',
  paymentMethod: 'mercado_pago',
  total: 231_000,
  expiresAt: '2026-10-30T12:30:00Z',
  checkoutUrl: null,
  checkoutError: false,
  items: [],
  transfer: { alias: 'ezyhome.tienda', cbu: null, holder: 'EzyHome SRL', bank: null },
  pickup: { address: null, hours: null },
  ...overrides,
});

describe('parseMpResult', () => {
  it.each([
    ['ok', 'ok'],
    ['error', 'error'],
    ['pendiente', 'pendiente'],
    ['otro', null],
    [null, null],
  ])('should read "%s" as %s', (value, expected) => {
    expect(parseMpResult(value)).toBe(expected);
  });
});

describe('mercadoPagoPollPlan', () => {
  it('should poll every second up to 15 s while the link is not ready', () => {
    expect(mercadoPagoPollPlan(buildOrder(), null)).toEqual(OPENING_POLL);
    expect(OPENING_POLL).toEqual({ intervalMs: 1000, maxPolls: 15 });
  });

  it('should stop polling once the link or the error arrives', () => {
    expect(mercadoPagoPollPlan(buildOrder({ checkoutUrl: CHECKOUT_URL }), null)).toBeNull();
    expect(mercadoPagoPollPlan(buildOrder({ checkoutError: true }), null)).toBeNull();
  });

  it('should poll every 2 s up to 30 s after Mercado Pago says the payment went through', () => {
    expect(mercadoPagoPollPlan(buildOrder({ checkoutUrl: CHECKOUT_URL }), 'ok')).toEqual(
      CONFIRMING_POLL,
    );
    expect(CONFIRMING_POLL).toEqual({ intervalMs: 2000, maxPolls: 15 });
  });

  it('should not poll a paid, transfer or failed-payment order', () => {
    expect(mercadoPagoPollPlan(buildOrder({ status: 'paid' }), 'ok')).toBeNull();
    expect(mercadoPagoPollPlan(buildOrder({ paymentMethod: 'transfer' }), null)).toBeNull();
    expect(mercadoPagoPollPlan(buildOrder(), 'error')).toBeNull();
    expect(mercadoPagoPollPlan(buildOrder(), 'pendiente')).toBeNull();
  });
});

describe('mercadoPagoView', () => {
  const view = (
    overrides: Partial<StoreOrder>,
    result: 'ok' | 'error' | 'pendiente' | null,
    timedOut = false,
  ) => mercadoPagoView(buildOrder(overrides), result, timedOut, NOW);

  it('should be opening while waiting for the link and failed after the timeout', () => {
    expect(view({}, null)).toEqual({ kind: 'opening' });
    expect(view({}, null, true)).toEqual({ kind: 'open_failed' });
    expect(view({ checkoutError: true }, null)).toEqual({ kind: 'open_failed' });
  });

  it('should offer the link while the order can still be paid', () => {
    expect(view({ checkoutUrl: CHECKOUT_URL }, null)).toEqual({ kind: 'pay', url: CHECKOUT_URL });
    expect(view({ checkoutUrl: CHECKOUT_URL, expiresAt: '2026-10-30T11:59:00Z' }, null)).toEqual({
      kind: 'open_failed',
    });
  });

  it('should confirm the payment while polling and say it is still checking after', () => {
    expect(view({}, 'ok')).toEqual({ kind: 'confirming' });
    expect(view({}, 'ok', true)).toEqual({ kind: 'confirm_pending' });
  });

  it('should offer to retry with the same link only while the order has not expired', () => {
    expect(view({ checkoutUrl: CHECKOUT_URL }, 'error')).toEqual({
      kind: 'payment_failed',
      retryUrl: CHECKOUT_URL,
    });
    expect(view({ checkoutUrl: CHECKOUT_URL, expiresAt: '2026-10-30T11:00:00Z' }, 'error')).toEqual(
      { kind: 'payment_failed', retryUrl: null },
    );
  });

  it('should say the payment is pending', () => {
    expect(view({}, 'pendiente')).toEqual({ kind: 'payment_pending' });
  });

  it('should follow the ERP once the order is closed, whatever Mercado Pago said', () => {
    expect(view({ status: 'paid' }, 'error')).toEqual({ kind: 'paid' });
    expect(view({ status: 'expired' }, 'ok')).toEqual({ kind: 'expired' });
    expect(view({ status: 'canceled' }, null)).toEqual({ kind: 'canceled' });
  });
});
