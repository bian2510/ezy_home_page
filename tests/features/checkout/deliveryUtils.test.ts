import { describe, expect, it } from 'vitest';
import {
  EMPTY_ADDRESS_FORM,
  addressErrorsFromApi,
  formatShippingAddress,
  orderDelivery,
  postalCodeDigits,
  quoteInput,
  shippingCost,
  validateAddressForm,
  type AddressForm,
} from '@/features/checkout/deliveryUtils';
import { SHIPPING_PROVINCES } from '@/features/checkout/shippingProvinces';

const ADDRESS: AddressForm = {
  province: 'B',
  postalCode: '1704',
  street: ' Av. Rivadavia ',
  streetNumber: ' 1234 ',
  floorApartment: '',
  city: ' Ramos Mejía ',
};

const OPTION = { token: 'tok-quote', name: 'Envío a domicilio', price: 8_500, deliveryTime: null };
const ITEMS = [{ sku: 'SKU-1', quantity: 2 }];

describe('SHIPPING_PROVINCES', () => {
  it('should list the 24 provinces with the one-letter code the ERP expects', () => {
    expect(SHIPPING_PROVINCES).toHaveLength(24);
    expect(SHIPPING_PROVINCES).toContainEqual({ code: 'C', name: 'CABA' });
    expect(SHIPPING_PROVINCES).toContainEqual({ code: 'B', name: 'Buenos Aires' });
    expect(new Set(SHIPPING_PROVINCES.map((province) => province.code)).size).toBe(24);
  });
});

describe('postalCodeDigits', () => {
  it('should keep up to 4 numbers', () => {
    expect(postalCodeDigits('B 1704 ab')).toBe('1704');
    expect(postalCodeDigits('170455')).toBe('1704');
  });
});

describe('quoteInput', () => {
  it('should build the quote request when the province and the postal code are valid', () => {
    expect(quoteInput(ADDRESS, ITEMS)).toEqual({
      province: 'B',
      postalCode: '1704',
      items: ITEMS,
    });
  });

  it.each([
    ['without province', { province: '' }],
    ['with an unknown province', { province: 'Ñ' }],
    ['with a short postal code', { postalCode: '170' }],
  ])('should not quote %s', (_case, overrides) => {
    expect(quoteInput({ ...ADDRESS, ...overrides }, ITEMS)).toBeNull();
  });

  it('should not quote an empty cart', () => {
    expect(quoteInput(ADDRESS, [])).toBeNull();
  });
});

describe('validateAddressForm', () => {
  it('should accept a full address with the floor left empty', () => {
    expect(validateAddressForm(ADDRESS)).toEqual({});
  });

  it('should ask for every required field of an empty address', () => {
    expect(validateAddressForm(EMPTY_ADDRESS_FORM)).toEqual({
      province: 'Elegí tu provincia',
      postalCode: 'El código postal tiene 4 números',
      street: 'Poné la calle',
      streetNumber: 'Poné la altura',
      city: 'Poné tu localidad',
    });
  });

  it('should limit the length of each field like the ERP', () => {
    const errors = validateAddressForm({
      ...ADDRESS,
      street: 'a'.repeat(101),
      streetNumber: '1'.repeat(11),
      floorApartment: 'b'.repeat(21),
      city: 'c'.repeat(81),
    });

    expect(Object.keys(errors).sort()).toEqual([
      'city',
      'floorApartment',
      'street',
      'streetNumber',
    ]);
  });
});

describe('addressErrorsFromApi', () => {
  it('should put the ERP errors of the address in the address fields', () => {
    expect(
      addressErrorsFromApi({
        shipping_street: ['es obligatorio'],
        shipping_postal_code: ['tiene que tener 4 números'],
        shipping_province: ['no es una provincia'],
        buyer_name: ['es obligatorio'],
      }),
    ).toEqual({
      street: 'es obligatorio',
      postalCode: 'tiene que tener 4 números',
      province: 'no es una provincia',
    });
  });
});

describe('orderDelivery', () => {
  it('should be pickup without anything else', () => {
    expect(orderDelivery('pickup', ADDRESS, null)).toEqual({ method: 'pickup' });
  });

  it('should carry the quote token and the trimmed address with home delivery', () => {
    expect(orderDelivery('carrier', ADDRESS, OPTION)).toEqual({
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
    });
  });

  it('should be null for home delivery without a quote', () => {
    expect(orderDelivery('carrier', ADDRESS, null)).toBeNull();
  });
});

describe('shippingCost', () => {
  it('should be free with pickup', () => {
    expect(shippingCost('pickup', null)).toBe(0);
  });

  it('should be the quoted price with home delivery', () => {
    expect(shippingCost('carrier', OPTION)).toBe(8_500);
  });

  it('should be unknown with home delivery and no quote', () => {
    expect(shippingCost('carrier', null)).toBeNull();
  });
});

describe('formatShippingAddress', () => {
  it('should write the address in one line with the province name and the postal code', () => {
    expect(formatShippingAddress({ ...ADDRESS, floorApartment: ' 3° B ' })).toBe(
      'Av. Rivadavia 1234, 3° B, Ramos Mejía, Buenos Aires (CP 1704)',
    );
  });

  it('should leave out what the buyer did not write yet', () => {
    expect(
      formatShippingAddress({ ...EMPTY_ADDRESS_FORM, province: 'C', postalCode: '1424' }),
    ).toBe('CABA (CP 1424)');
  });

  it('should be null for an empty address', () => {
    expect(formatShippingAddress(EMPTY_ADDRESS_FORM)).toBeNull();
  });
});
