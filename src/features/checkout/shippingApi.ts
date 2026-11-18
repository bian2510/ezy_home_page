// Cliente de la cotización del envío a domicilio en el ERP
// (`POST /api/store/shipping/quotes`, ADR-030 §9 del ERP y ADR-007 del sitio).
// Único lugar del sitio que conoce la forma de esa respuesta. Ver
// docs/standards/llamadas-al-backend.md.
import type { StoreApiConfig } from '@/types';

/** Lo que el sitio pide: dónde va y qué lleva. Nunca un precio. */
export interface ShippingQuoteRequest {
  /** Código de una letra de `shippingProvinces.ts`. */
  province: string;
  /** 4 números. */
  postalCode: string;
  items: { sku: string; quantity: number }[];
}

/** Una opción cotizada. El pedido la referencia por `token`. */
export interface ShippingOption {
  token: string;
  name: string;
  /** Precio al comprador en pesos enteros, el mismo con transferencia y con Mercado Pago. */
  price: number;
  /** Plazo que carga el comercio ("3 a 5 días hábiles"); `null` si no hay. */
  deliveryTime: string | null;
}

/** Nombre de la opción si el ERP no lo manda (el apéndice "Tarifa propia" lo suma). */
const DEFAULT_NAME = 'Envío a domicilio';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const textOrNull = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() !== '' ? value : null;

const toOption = (value: unknown): ShippingOption | null => {
  if (!isRecord(value)) return null;
  const { token, price } = value;
  if (typeof token !== 'string' || token === '' || typeof price !== 'number') return null;
  return {
    token,
    name: textOrNull(value.name) ?? DEFAULT_NAME,
    price,
    deliveryTime: textOrNull(value.delivery_time),
  };
};

/**
 * Cotiza el envío. Devuelve las opciones (puede ser ninguna). Tira si el ERP
 * responde con error (404 sin envíos, 422 productos sin peso o medidas) y deja
 * pasar la falla de red: en todos los casos el sitio ofrece WhatsApp.
 */
export const quoteShipping = async (
  request: ShippingQuoteRequest,
  config: StoreApiConfig,
  signal?: AbortSignal,
): Promise<ShippingOption[]> => {
  const response = await fetch(`${config.baseUrl}/api/store/shipping/quotes`, {
    method: 'POST',
    headers: {
      'x-api-key': config.apiKey,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      province: request.province,
      postal_code: request.postalCode,
      items: request.items.map(({ sku, quantity }) => ({ sku, quantity })),
    }),
    signal: signal ?? null,
  });
  if (!response.ok) throw new Error(`La cotización del envío respondió ${response.status}`);
  const body: unknown = await response.json();
  const options = isRecord(body) && Array.isArray(body.options) ? body.options : [];
  return options.map(toOption).filter((option): option is ShippingOption => option !== null);
};
