// Reglas puras de la entrega del checkout (ADR-007): retiro sin cargo o envío a
// domicilio cotizado por el ERP. Sin React ni red.
import type { OrderDelivery } from './ordersApi';
import type { ShippingOption, ShippingQuoteRequest } from './shippingApi';
import { SHIPPING_PROVINCES, isProvinceCode } from './shippingProvinces';

export type DeliveryMethod = 'pickup' | 'carrier';

/** Lo que carga el comprador para el envío a domicilio. */
export interface AddressForm {
  /** Código de una letra (`shippingProvinces.ts`). */
  province: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  /** Opcional. */
  floorApartment: string;
  city: string;
}

export type AddressField = keyof AddressForm;
export type AddressErrors = Partial<Record<AddressField, string>>;

export const EMPTY_ADDRESS_FORM: AddressForm = {
  province: '',
  postalCode: '',
  street: '',
  streetNumber: '',
  floorApartment: '',
  city: '',
};

/** El CP de los envíos: 4 números ("1704"), sin las letras del CPA. */
export const postalCodeDigits = (value: string): string => value.replace(/\D/g, '').slice(0, 4);

const POSTAL_CODE = /^\d{4}$/;

/**
 * Pedido de cotización si la provincia y el CP alcanzan para cotizar; `null`
 * si falta algo. El resto de la dirección no cambia el precio.
 */
export const quoteInput = (
  address: AddressForm,
  items: ShippingQuoteRequest['items'],
): ShippingQuoteRequest | null =>
  isProvinceCode(address.province) && POSTAL_CODE.test(address.postalCode) && items.length > 0
    ? { province: address.province, postalCode: address.postalCode, items }
    : null;

// Largos máximos del ERP (`Store.Schemas.OrderRequest`).
const LIMITS = { street: 100, streetNumber: 10, floorApartment: 20, city: 80 } as const;

/**
 * Validación del navegador, igual a la del ERP, para avisar antes de mandar.
 * El ERP vuelve a validar: manda la del ERP.
 */
export const validateAddressForm = (address: AddressForm): AddressErrors => {
  const errors: AddressErrors = {};
  const street = address.street.trim();
  const streetNumber = address.streetNumber.trim();
  const city = address.city.trim();

  if (!isProvinceCode(address.province)) errors.province = 'Elegí tu provincia';
  if (!POSTAL_CODE.test(address.postalCode)) errors.postalCode = 'El código postal tiene 4 números';
  if (street === '') errors.street = 'Poné la calle';
  else if (street.length > LIMITS.street) errors.street = `Hasta ${LIMITS.street} letras`;
  if (streetNumber === '') errors.streetNumber = 'Poné la altura';
  else if (streetNumber.length > LIMITS.streetNumber) {
    errors.streetNumber = `Hasta ${LIMITS.streetNumber} caracteres`;
  }
  if (address.floorApartment.trim().length > LIMITS.floorApartment) {
    errors.floorApartment = `Hasta ${LIMITS.floorApartment} caracteres`;
  }
  if (city === '') errors.city = 'Poné tu localidad';
  else if (city.length > LIMITS.city) errors.city = `Hasta ${LIMITS.city} letras`;
  return errors;
};

const API_FIELDS: Record<string, AddressField> = {
  shipping_province: 'province',
  shipping_postal_code: 'postalCode',
  shipping_street: 'street',
  shipping_street_number: 'streetNumber',
  shipping_floor_apartment: 'floorApartment',
  shipping_city: 'city',
};

/** Errores por campo del ERP (422) en los campos de la dirección. */
export const addressErrorsFromApi = (fieldErrors: Record<string, string[]>): AddressErrors =>
  Object.entries(fieldErrors).reduce<AddressErrors>((errors, [apiField, messages]) => {
    const field = API_FIELDS[apiField];
    const message = messages[0];
    return field === undefined || message === undefined ? errors : { ...errors, [field]: message };
  }, {});

/** Los errores sin el de un campo: se borra al volver a escribir en él. */
export const withoutAddressField = (errors: AddressErrors, field: AddressField): AddressErrors =>
  Object.fromEntries(Object.entries(errors).filter(([key]) => key !== field));

/**
 * La entrega que va en el pedido. Con envío a domicilio hace falta la
 * cotización: sin ella, `null` (no se puede mandar el pedido).
 */
export const orderDelivery = (
  method: DeliveryMethod,
  address: AddressForm,
  option: ShippingOption | null,
): OrderDelivery | null => {
  if (method === 'pickup') return { method: 'pickup' };
  if (option === null) return null;
  return {
    method: 'carrier',
    quoteToken: option.token,
    address: {
      province: address.province,
      postalCode: address.postalCode,
      street: address.street.trim(),
      streetNumber: address.streetNumber.trim(),
      floorApartment: address.floorApartment.trim(),
      city: address.city.trim(),
    },
  };
};

/** Costo del envío para los totales: 0 con retiro, `null` si todavía no hay cotización. */
export const shippingCost = (
  method: DeliveryMethod,
  option: ShippingOption | null,
): number | null => (method === 'pickup' ? 0 : (option?.price ?? null));

/**
 * La dirección en una línea para el mensaje de WhatsApp ("Av. Rivadavia 1234,
 * 3° B, Ramos Mejía, Buenos Aires (CP 1704)"), con lo que el comprador ya
 * escribió. `null` si no escribió nada.
 */
export const formatShippingAddress = (address: AddressForm): string | null => {
  const street = [address.street.trim(), address.streetNumber.trim()].filter(Boolean).join(' ');
  const province = SHIPPING_PROVINCES.find(({ code }) => code === address.province)?.name ?? '';
  const place = [street, address.floorApartment.trim(), address.city.trim(), province]
    .filter(Boolean)
    .join(', ');
  const postalCode = address.postalCode === '' ? '' : `(CP ${address.postalCode})`;
  const line = [place, postalCode].filter(Boolean).join(' ');
  return line === '' ? null : line;
};
