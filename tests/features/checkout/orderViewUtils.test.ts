import { describe, expect, it } from 'vitest';
import {
  orderHero,
  paymentMethodLabel,
  showsSmartHomeTip,
  statusOffersWhatsApp,
  transferStatusLabel,
} from '@/features/checkout/orderViewUtils';
import type { StoreOrder } from '@/features/checkout/ordersApi';

const buildOrder = (overrides: Partial<StoreOrder> = {}): StoreOrder => ({
  token: 'tok-1',
  number: 7,
  status: 'pending_payment',
  paymentMethod: 'transfer',
  total: 220_000,
  expiresAt: null,
  checkoutUrl: null,
  checkoutError: false,
  items: [],
  transfer: { alias: 'ezyhome.tienda', cbu: null, holder: 'EzyHome SRL', bank: null },
  pickup: { address: null, hours: null },
  ...overrides,
});

describe('orderHero', () => {
  it('should thank and confirm a paid order, with or without Mercado Pago', () => {
    const expected = {
      tone: 'confirmed',
      eyebrow: 'Pedido confirmado',
      title: '¡Gracias por tu compra!',
      body: 'Tu pedido #7 está confirmado. Te mandamos el detalle por email.',
    };
    expect(orderHero(buildOrder({ status: 'paid' }))).toEqual(expected);
    expect(orderHero(buildOrder({ status: 'paid', paymentMethod: 'mercado_pago' }))).toEqual(
      expected,
    );
  });

  it('should say a pending transfer order was received, not completed', () => {
    expect(orderHero(buildOrder())).toEqual({
      tone: 'received',
      eyebrow: 'Pedido recibido',
      title: '¡Recibimos tu pedido!',
      body: 'Tu pedido #7 queda confirmado cuando acreditemos la transferencia.',
    });
  });

  it('should say a pending Mercado Pago order waits for the payment', () => {
    expect(orderHero(buildOrder({ paymentMethod: 'mercado_pago' }))).toEqual({
      tone: 'received',
      eyebrow: 'Pedido recibido',
      title: '¡Recibimos tu pedido!',
      body: 'Tu pedido #7 queda confirmado cuando Mercado Pago apruebe el pago.',
    });
  });

  it('should not celebrate an expired or canceled order', () => {
    expect(orderHero(buildOrder({ status: 'expired' }))).toEqual({
      tone: 'closed',
      eyebrow: 'Pedido vencido',
      title: 'No se completó el pago',
      body: null,
    });
    expect(orderHero(buildOrder({ status: 'canceled' }))).toEqual({
      tone: 'closed',
      eyebrow: 'Pedido cancelado',
      title: 'Este pedido ya no está activo',
      body: null,
    });
  });
});

describe('paymentMethodLabel and transferStatusLabel', () => {
  it('should name the method the order was paid with', () => {
    expect(paymentMethodLabel('mercado_pago')).toBe('Mercado Pago');
    expect(paymentMethodLabel('transfer')).toBe('Transferencia bancaria');
  });

  it('should say "Pago aprobado" only when paid, and the real status otherwise', () => {
    expect(transferStatusLabel(buildOrder({ status: 'paid' }))).toBe('Pago aprobado');
    expect(transferStatusLabel(buildOrder())).toBe('Esperando la transferencia');
    // Vencido o cancelado: lo cuenta el mensaje del estado, como hoy.
    expect(transferStatusLabel(buildOrder({ status: 'expired' }))).toBeNull();
    expect(transferStatusLabel(buildOrder({ status: 'canceled' }))).toBeNull();
  });
});

describe('showsSmartHomeTip', () => {
  it('should invite to prepare the smart home only for live orders', () => {
    expect(showsSmartHomeTip(buildOrder({ status: 'paid' }))).toBe(true);
    expect(showsSmartHomeTip(buildOrder())).toBe(true);
    expect(showsSmartHomeTip(buildOrder({ status: 'expired' }))).toBe(false);
    expect(showsSmartHomeTip(buildOrder({ status: 'canceled' }))).toBe(false);
  });
});

describe('statusOffersWhatsApp', () => {
  const mp = (overrides: Partial<StoreOrder> = {}) =>
    buildOrder({ paymentMethod: 'mercado_pago', ...overrides });

  it('should be true when the Mercado Pago message already links to WhatsApp', () => {
    expect(statusOffersWhatsApp(mp({ checkoutError: true }), null, false)).toBe(true);
    expect(statusOffersWhatsApp(mp(), 'error', false)).toBe(true);
    expect(statusOffersWhatsApp(mp({ status: 'expired' }), null, false)).toBe(true);
  });

  it('should be false otherwise, so the page offers its own WhatsApp line', () => {
    expect(
      statusOffersWhatsApp(mp({ checkoutUrl: 'https://www.mercadopago.com.ar/x' }), null, false),
    ).toBe(false);
    expect(statusOffersWhatsApp(mp({ status: 'paid' }), null, false)).toBe(false);
    expect(statusOffersWhatsApp(buildOrder({ status: 'expired' }), null, false)).toBe(false);
    expect(statusOffersWhatsApp(buildOrder(), null, false)).toBe(false);
  });
});
