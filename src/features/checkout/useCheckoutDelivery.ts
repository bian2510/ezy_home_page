// Estado de la entrega del checkout (ADR-007): retiro o envío a domicilio, la
// dirección con sus errores y la cotización del ERP. `CheckoutPage` lo usa para
// validar, armar el pedido y sumar el envío al total.
import { useCallback, useMemo, useState } from 'react';
import {
  EMPTY_ADDRESS_FORM,
  addressErrorsFromApi,
  orderDelivery,
  postalCodeDigits,
  quoteInput,
  shippingCost,
  validateAddressForm,
  withoutAddressField,
  type AddressErrors,
  type AddressField,
  type AddressForm,
  type DeliveryMethod,
} from './deliveryUtils';
import type { OrderDelivery } from './ordersApi';
import type { ShippingQuoteRequest } from './shippingApi';
import { useShippingQuote, type QuoteState } from './useShippingQuote';

export interface CheckoutDelivery {
  method: DeliveryMethod;
  setMethod: (method: DeliveryMethod) => void;
  address: AddressForm;
  errors: AddressErrors;
  changeAddress: (field: AddressField, value: string) => void;
  quote: QuoteState;
  refreshQuote: () => void;
  /** 0 con retiro; el precio cotizado con envío; `null` mientras no hay cotización. */
  cost: number | null;
  /** `true` si se puede mandar el pedido con esta entrega. Marca los errores. */
  validate: () => boolean;
  /** La entrega del pedido; `null` si todavía no se puede mandar. */
  toOrderDelivery: () => OrderDelivery | null;
  /** Errores por campo del ERP (422) en la dirección. */
  showApiErrors: (fieldErrors: Record<string, string[]>) => void;
}

export function useCheckoutDelivery(items: ShippingQuoteRequest['items']): CheckoutDelivery {
  const [method, setMethod] = useState<DeliveryMethod>('pickup');
  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS_FORM);
  const [errors, setErrors] = useState<AddressErrors>({});

  // Solo se cotiza con envío a domicilio elegido.
  const input = useMemo(
    () => (method === 'carrier' ? quoteInput(address, items) : null),
    [method, address, items],
  );
  const { state: quote, refresh: refreshQuote } = useShippingQuote(input);
  const option = quote.status === 'ready' ? quote.option : null;

  const changeAddress = useCallback((field: AddressField, value: string) => {
    const clean = field === 'postalCode' ? postalCodeDigits(value) : value;
    setAddress((current) => ({ ...current, [field]: clean }));
    setErrors((current) => withoutAddressField(current, field));
  }, []);

  const validate = () => {
    if (method === 'pickup') return true;
    const found = validateAddressForm(address);
    setErrors(found);
    return Object.keys(found).length === 0 && option !== null;
  };

  return {
    method,
    setMethod,
    address,
    errors: method === 'carrier' ? errors : {},
    changeAddress,
    quote,
    refreshQuote,
    cost: shippingCost(method, option),
    validate,
    toOrderDelivery: () => orderDelivery(method, address, option),
    showApiErrors: (fieldErrors) => setErrors(addressErrorsFromApi(fieldErrors)),
  };
}
