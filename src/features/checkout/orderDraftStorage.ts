// Datos de un pedido de Mercado Pago (comprador e ítems) guardados en la
// pestaña para que, si MP falla, el comprador pase a transferencia sin volver a
// cargar todo: el ERP nunca devuelve los datos del comprador y el carrito ya se
// vació. `sessionStorage` sobrevive la ida y vuelta a Mercado Pago en la misma
// pestaña y se borra al cerrarla. Si el navegador no deja guardar, no se ofrece
// el cambio (queda WhatsApp). Con envío a domicilio guarda también la dirección
// y la cotización, para que el pedido por transferencia salga con el mismo envío.
import type { OrderDelivery } from './ordersApi';
import type { OrderDraft } from './useCreateOrder';

const keyFor = (token: string): string => `ezyhome_pedido_mp:${token}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const ADDRESS_FIELDS = [
  'province',
  'postalCode',
  'street',
  'streetNumber',
  'floorApartment',
  'city',
];

const isDelivery = (value: unknown): value is OrderDelivery => {
  if (!isRecord(value)) return false;
  if (value.method === 'pickup') return true;
  const { address } = value;
  return (
    value.method === 'carrier' &&
    typeof value.quoteToken === 'string' &&
    isRecord(address) &&
    ADDRESS_FIELDS.every((field) => typeof address[field] === 'string')
  );
};

// Un borrador guardado antes del envío a domicilio no trae la entrega: era retiro.
const withDelivery = (value: unknown): unknown =>
  isRecord(value) && value.delivery === undefined
    ? { ...value, delivery: { method: 'pickup' } }
    : value;

const isDraft = (value: unknown): value is OrderDraft => {
  if (!isRecord(value) || !isRecord(value.buyer) || !Array.isArray(value.items)) return false;
  const { buyer } = value;
  return (
    ['name', 'phone', 'email', 'document'].every((field) => typeof buyer[field] === 'string') &&
    value.items.every(
      (item) => isRecord(item) && typeof item.sku === 'string' && typeof item.quantity === 'number',
    ) &&
    value.acceptedPrivacy === true &&
    (value.paymentMethod === 'transfer' || value.paymentMethod === 'mercado_pago') &&
    isDelivery(value.delivery)
  );
};

export const saveOrderDraft = (token: string, draft: OrderDraft): void => {
  try {
    window.sessionStorage.setItem(keyFor(token), JSON.stringify(draft));
  } catch {
    // Sin storage no hay cambio a transferencia; el pedido sigue igual.
  }
};

export const loadOrderDraft = (token: string): OrderDraft | null => {
  try {
    const raw = window.sessionStorage.getItem(keyFor(token));
    const parsed: unknown = raw === null ? null : withDelivery(JSON.parse(raw));
    return isDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const forgetOrderDraft = (token: string): void => {
  try {
    window.sessionStorage.removeItem(keyFor(token));
  } catch {
    // Nada que borrar.
  }
};
