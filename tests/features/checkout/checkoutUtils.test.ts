import { describe, expect, it } from 'vitest';
import {
  EMPTY_BUYER_FORM,
  checkoutBlocker,
  describeOrderError,
  fieldErrorsFromApi,
  formatDeadline,
  mercadoPagoTotal,
  phoneDigits,
  stockAdjustments,
  transferTotal,
  validateBuyerForm,
} from '@/features/checkout/checkoutUtils';
import { OrderApiError } from '@/features/checkout/ordersApi';
import type { Product, ProductPricing } from '@/types';
import { buildCartItem, buildProduct } from '../../helpers/builders';

const priced =
  (byId: Record<string, ProductPricing>) =>
  (product: Product): ProductPricing =>
    byId[product.id] ?? { price: null, transferPrice: null, availability: 'no_price' };

const AVAILABLE: ProductPricing = {
  price: 21_000,
  transferPrice: 20_000,
  availability: 'available',
  stock: 5,
};

const VALID_FORM = {
  name: 'Ana Pérez',
  phone: '11 5555-4444',
  email: 'ana@mail.com',
  document: '30.111.222',
  acceptedPrivacy: true,
};

// WhatsApp: exactamente 10 números, código de área + número, sin 0 ni 15 ni +54
// (usuario, 2026-10-30).
describe('validateBuyerForm WhatsApp', () => {
  const phoneError = (phone: string) => validateBuyerForm({ ...VALID_FORM, phone }).phone;
  const GUIDE = 'Ingresá tu número con código de área, sin 0 ni 15 (10 números)';

  it.each(['1155554444', '11 5555-4444', '351 555-4444', '2944 55-4444'])(
    'should accept the 10 digits %s',
    (phone) => {
      expect(phoneError(phone)).toBeUndefined();
    },
  );

  it.each([
    ['9 digits', '115555444'],
    ['11 digits', '11555544441'],
    ['a leading 0', '01155554444'],
    ['a leading 0 in 10 digits', '0115555444'],
    ['the 15 without area code', '1555554444'],
    ['the area code and 15', '111555554444'],
    ['+54', '+54 11 5555-4444'],
    ['+54 9', '+54 9 11 5555-4444'],
    ['nothing', ''],
  ])('should reject a phone with %s and explain the format', (_case, phone) => {
    expect(phoneError(phone)).toBe(GUIDE);
  });
});

describe('phoneDigits', () => {
  it('should keep only the digits', () => {
    expect(phoneDigits(' 11 5555-4444 ')).toBe('1155554444');
  });
});

describe('validateBuyerForm', () => {
  it('should accept a complete form', () => {
    expect(validateBuyerForm(VALID_FORM)).toEqual({});
  });

  it('should ask for name, WhatsApp, email, DNI and the privacy notice', () => {
    expect(Object.keys(validateBuyerForm(EMPTY_BUYER_FORM)).sort()).toEqual([
      'acceptedPrivacy',
      'document',
      'email',
      'name',
      'phone',
    ]);
  });

  // El DNI es obligatorio (usuario, 2026-10-29): para facturar y saber quién retira.
  it('should ask for the DNI when it is blank', () => {
    expect(validateBuyerForm({ ...VALID_FORM, document: '  ' }).document).toMatch(/dni/i);
  });

  it('should reject a bad email and a bad DNI', () => {
    const errors = validateBuyerForm({
      ...VALID_FORM,
      email: 'ana@',
      document: '12',
    });

    expect(errors.email).toMatch(/email/i);
    expect(errors.document).toMatch(/7 u 8/);
  });
});

describe('transferTotal', () => {
  it('should add the transfer price of every unit', () => {
    const items = [buildCartItem({ quantity: 2 })];

    expect(transferTotal(items, priced({ 'p-1': AVAILABLE }))).toBe(40_000);
  });

  it('should use the single price when transfer is not cheaper', () => {
    const items = [buildCartItem({ quantity: 1 })];
    const single = { ...AVAILABLE, price: 20_000, transferPrice: null };

    expect(transferTotal(items, priced({ 'p-1': single }))).toBe(20_000);
  });
});

describe('mercadoPagoTotal', () => {
  it('should add the Mercado Pago price of every unit', () => {
    const items = [buildCartItem({ quantity: 2 })];

    expect(mercadoPagoTotal(items, priced({ 'p-1': AVAILABLE }))).toBe(42_000);
  });
});

describe('checkoutBlocker', () => {
  it('should let a cart with price and stock check out', () => {
    expect(checkoutBlocker([buildCartItem()], priced({ 'p-1': AVAILABLE }))).toBeNull();
  });

  it('should block an empty cart', () => {
    expect(checkoutBlocker([], priced({}))).toMatch(/vacío/i);
  });

  it('should block while prices load', () => {
    const loading: ProductPricing = { price: null, transferPrice: null, availability: 'loading' };

    expect(checkoutBlocker([buildCartItem()], priced({ 'p-1': loading }))).toMatch(/cargando/i);
  });

  it('should block a product without price or stock and send to WhatsApp', () => {
    const items = [buildCartItem(), buildCartItem({ product: buildProduct({ id: 'p-2' }) })];

    expect(checkoutBlocker(items, priced({ 'p-1': AVAILABLE }))).toMatch(/whatsapp/i);
  });
});

describe('fieldErrorsFromApi', () => {
  it('should map the ERP fields to the form fields', () => {
    expect(
      fieldErrorsFromApi({
        buyer_name: ['debe tener de 2 a 80 letras'],
        buyer_phone: ['debe tener de 8 a 20 números'],
        buyer_email: ['no es un email válido'],
        buyer_document: ['debe tener 7 u 8 números'],
        accepted_privacy: ['tenés que aceptar el aviso de privacidad'],
        items: ['raro'],
      }),
    ).toEqual({
      name: 'debe tener de 2 a 80 letras',
      phone: 'debe tener de 8 a 20 números',
      email: 'no es un email válido',
      document: 'debe tener 7 u 8 números',
      acceptedPrivacy: 'tenés que aceptar el aviso de privacidad',
    });
  });
});

describe('stockAdjustments', () => {
  it('should say how many units of each product are left', () => {
    const product = buildProduct({ id: 'p-1', sku: 'SKU-1', name: 'Válvula' });

    expect(
      stockAdjustments(
        [{ sku: 'sku-1 ', available: 1 }],
        [buildCartItem({ product, quantity: 3 })],
      ),
    ).toEqual([{ productId: 'p-1', name: 'Válvula', available: 1 }]);
  });
});

describe('describeOrderError', () => {
  it('should explain a network failure', () => {
    expect(describeOrderError(new TypeError('Failed to fetch'))).toMatch(/conexión/i);
  });

  it('should use the ERP message when there is one', () => {
    const error = new OrderApiError(429, { detail: 'Hiciste muchos pedidos seguidos.' });

    expect(describeOrderError(error)).toBe('Hiciste muchos pedidos seguidos.');
  });

  it('should ask to review the data on a 422 with field errors', () => {
    const error = new OrderApiError(422, { buyer_phone: ['mal'] });

    expect(describeOrderError(error)).toMatch(/revisá/i);
  });

  it('should fall back to WhatsApp on any other error', () => {
    expect(describeOrderError(new OrderApiError(500, {}))).toMatch(/whatsapp/i);
  });
});

describe('formatDeadline', () => {
  it('should show the deadline in Argentina time', () => {
    expect(formatDeadline('2026-10-31T15:00:00Z')).toBe('31/10, 12:00');
  });

  it('should return null without a valid date', () => {
    expect(formatDeadline(null)).toBeNull();
    expect(formatDeadline('mañana')).toBeNull();
  });
});
