import { afterEach, describe, expect, it } from 'vitest';
import { loadOrderDraft, saveOrderDraft } from '@/features/checkout/orderDraftStorage';
import type { OrderDraft } from '@/features/checkout/useCreateOrder';

const BASE = {
  buyer: { name: 'Ana Pérez', phone: '1155554444', email: 'ana@mail.com', document: '30111222' },
  items: [{ sku: 'SKU-1', quantity: 2 }],
  acceptedPrivacy: true,
  paymentMethod: 'mercado_pago',
} as const;

const CARRIER_DRAFT: OrderDraft = {
  ...BASE,
  items: [...BASE.items],
  buyer: { ...BASE.buyer },
  delivery: {
    method: 'carrier',
    quoteToken: 'tok-quote',
    address: {
      province: 'B',
      postalCode: '1704',
      street: 'Av. Rivadavia',
      streetNumber: '1234',
      floorApartment: '',
      city: 'Ramos Mejía',
    },
  },
};

describe('orderDraftStorage', () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it('should keep the home delivery so the switch to transfer ships it too', () => {
    saveOrderDraft('tok-mp', CARRIER_DRAFT);

    expect(loadOrderDraft('tok-mp')).toEqual(CARRIER_DRAFT);
  });

  it('should read a draft saved before home delivery as pickup', () => {
    window.sessionStorage.setItem('ezyhome_pedido_mp:tok-mp', JSON.stringify(BASE));

    expect(loadOrderDraft('tok-mp')).toEqual({ ...BASE, delivery: { method: 'pickup' } });
  });

  it('should not offer a draft whose home delivery has no address', () => {
    window.sessionStorage.setItem(
      'ezyhome_pedido_mp:tok-mp',
      JSON.stringify({ ...BASE, delivery: { method: 'carrier', quoteToken: 'tok-quote' } }),
    );

    expect(loadOrderDraft('tok-mp')).toBeNull();
  });
});
