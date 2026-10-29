// Cliente de los pedidos de la tienda en el ERP (plan de la etapa 3 del ERP,
// `POST /api/store/orders` y `GET /api/store/orders/:token`). Único lugar del
// sitio que conoce la forma de esas respuestas. Ver
// docs/standards/llamadas-al-backend.md y ADR-005.
import type { StoreApiConfig } from '@/types';

/** Comprador del pedido. El DNI es obligatorio (lo valida también el ERP). */
export interface OrderBuyer {
  name: string;
  phone: string;
  email: string;
  document: string;
}

/** Lo que el sitio pide. Nunca lleva precios: los calcula el ERP. */
export interface OrderRequest {
  /** Una por intento de compra: si se reintenta lo mismo, el ERP no duplica. */
  idempotencyKey: string;
  buyer: OrderBuyer;
  items: { sku: string; quantity: number }[];
  acceptedPrivacy: boolean;
}

export interface StoreOrderItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export type StoreOrderStatus = 'pending_payment' | 'paid' | 'expired' | 'canceled';

/** Pedido según el ERP. Sin datos del comprador: el ERP no los devuelve. */
export interface StoreOrder {
  token: string;
  number: number;
  status: StoreOrderStatus;
  total: number;
  /** ISO 8601; `null` si el ERP no fijó vencimiento. */
  expiresAt: string | null;
  items: StoreOrderItem[];
  transfer: {
    alias: string | null;
    cbu: string | null;
    holder: string | null;
    bank: string | null;
  };
  pickup: { address: string | null; hours: string | null };
}

export interface CreateOrderResult {
  order: StoreOrder;
  /** `false` cuando el ERP devolvió un pedido ya creado por el mismo intento. */
  created: boolean;
}

/** Faltante de stock que informa el ERP (409). */
export interface StockIssue {
  sku: string;
  available: number;
}

/**
 * Respuesta no-2xx del ERP. Lleva lo que el ERP explicó para que la pantalla
 * decida qué mostrar: mensaje general, errores por campo (`buyer_phone`, …),
 * faltantes de stock o SKU que la tienda no vende.
 */
export class OrderApiError extends Error {
  readonly status: number;
  readonly detail: string | null;
  readonly fieldErrors: Record<string, string[]>;
  readonly stockIssues: StockIssue[];
  readonly unknownSkus: string[];

  constructor(status: number, errors: Record<string, unknown>) {
    super(`La API de pedidos respondió ${status}`);
    this.name = 'OrderApiError';
    this.status = status;
    this.detail = typeof errors.detail === 'string' ? errors.detail : null;
    this.fieldErrors = Object.fromEntries(
      Object.entries(errors).filter(
        (entry): entry is [string, string[]] =>
          !['detail', 'items', 'skus'].includes(entry[0]) && isStringArray(entry[1]),
      ),
    );
    this.stockIssues = Array.isArray(errors.items) ? errors.items.filter(isStockIssue) : [];
    this.unknownSkus = isStringArray(errors.skus) ? errors.skus : [];
  }
}

const PAYMENT_METHOD = 'transfer';
const STATUSES: readonly StoreOrderStatus[] = ['pending_payment', 'paid', 'expired', 'canceled'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string');

const isStockIssue = (value: unknown): value is StockIssue =>
  isRecord(value) && typeof value.sku === 'string' && typeof value.available === 'number';

const textOrNull = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null;

const toItem = (value: unknown): StoreOrderItem | null => {
  if (!isRecord(value)) return null;
  const { sku, name, quantity, unit_price: unitPrice, line_total: lineTotal } = value;
  if (
    typeof sku !== 'string' ||
    typeof name !== 'string' ||
    typeof quantity !== 'number' ||
    typeof unitPrice !== 'number' ||
    typeof lineTotal !== 'number'
  ) {
    return null;
  }
  return { sku, name, quantity, unitPrice, lineTotal };
};

const toOrder = (value: unknown): StoreOrder => {
  if (!isRecord(value)) throw new Error('La respuesta del pedido no tiene la forma esperada');
  const { token, number, status, total, items } = value;
  if (
    typeof token !== 'string' ||
    typeof number !== 'number' ||
    typeof total !== 'number' ||
    !STATUSES.includes(status as StoreOrderStatus) ||
    !Array.isArray(items)
  ) {
    throw new Error('La respuesta del pedido no tiene la forma esperada');
  }
  const transfer = isRecord(value.transfer) ? value.transfer : {};
  const pickup = isRecord(value.pickup) ? value.pickup : {};
  return {
    token,
    number,
    status: status as StoreOrderStatus,
    total,
    expiresAt: textOrNull(value.expires_at),
    items: items.map(toItem).filter((item): item is StoreOrderItem => item !== null),
    transfer: {
      alias: textOrNull(transfer.alias),
      cbu: textOrNull(transfer.cbu),
      holder: textOrNull(transfer.holder),
      bank: textOrNull(transfer.bank),
    },
    pickup: { address: textOrNull(pickup.address), hours: textOrNull(pickup.hours) },
  };
};

const readErrors = async (response: Response): Promise<Record<string, unknown>> => {
  try {
    const body: unknown = await response.json();
    return isRecord(body) && isRecord(body.errors) ? body.errors : {};
  } catch {
    return {};
  }
};

const readOrder = async (response: Response): Promise<StoreOrder> => {
  if (!response.ok) throw new OrderApiError(response.status, await readErrors(response));
  const body: unknown = await response.json();
  return toOrder(isRecord(body) ? body.order : undefined);
};

const toRequestBody = (request: OrderRequest) => ({
  idempotency_key: request.idempotencyKey,
  payment_method: PAYMENT_METHOD,
  accepted_privacy: request.acceptedPrivacy,
  buyer: {
    name: request.buyer.name,
    phone: request.buyer.phone,
    email: request.buyer.email,
    document: request.buyer.document.trim(),
  },
  items: request.items.map(({ sku, quantity }) => ({ sku, quantity })),
});

/**
 * Crea el pedido por transferencia con retiro. Tira `OrderApiError` si el ERP
 * responde con error (409 sin stock, 422 datos, 429 límite) y deja pasar la
 * falla de red: quien llama decide qué mostrar.
 */
export const createOrder = async (
  request: OrderRequest,
  config: StoreApiConfig,
): Promise<CreateOrderResult> => {
  const response = await fetch(`${config.baseUrl}/api/store/orders`, {
    method: 'POST',
    headers: {
      'x-api-key': config.apiKey,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(toRequestBody(request)),
  });
  const order = await readOrder(response);
  return { order, created: response.status === 201 };
};

/** Lee un pedido por su token. 404 si no existe (tira `OrderApiError`). */
export const fetchOrder = async (token: string, config: StoreApiConfig): Promise<StoreOrder> => {
  const response = await fetch(`${config.baseUrl}/api/store/orders/${encodeURIComponent(token)}`, {
    headers: { 'x-api-key': config.apiKey, accept: 'application/json' },
  });
  return readOrder(response);
};
