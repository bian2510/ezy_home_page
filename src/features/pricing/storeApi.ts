// Cliente de la API de la tienda en el ERP: precio y stock por SKU
// (ADR-025 del ERP, `GET /api/store/products`). Único lugar del sitio que
// conoce la forma de esa respuesta.
import type { StoreApiConfig } from '@/types';

export type { StoreApiConfig };

/** Precio y stock de un SKU según el ERP. */
export interface StoreQuote {
  sku: string;
  /** Precio pagando con Mercado Pago (precio del local + recargo, redondeado). */
  priceMp: number;
  /** Precio con transferencia (precio del local − descuento). */
  priceTransfer: number;
  stock: number;
  available: boolean;
}

/** El ERP rechaza más de 200 SKU por pedido. */
const MAX_SKUS_PER_REQUEST = 200;

interface ErpProduct {
  sku: string;
  price_mp: number;
  price_transfer: number;
  stock: number;
  available: boolean;
}

const isErpProduct = (value: unknown): value is ErpProduct => {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.sku === 'string' &&
    typeof entry.price_mp === 'number' &&
    typeof entry.price_transfer === 'number' &&
    typeof entry.stock === 'number' &&
    typeof entry.available === 'boolean'
  );
};

const toQuote = (entry: ErpProduct): StoreQuote => ({
  sku: entry.sku,
  priceMp: entry.price_mp,
  priceTransfer: entry.price_transfer,
  stock: entry.stock,
  available: entry.available,
});

const chunk = (skus: string[]): string[][] => {
  const chunks: string[][] = [];
  for (let start = 0; start < skus.length; start += MAX_SKUS_PER_REQUEST) {
    chunks.push(skus.slice(start, start + MAX_SKUS_PER_REQUEST));
  }
  return chunks;
};

const fetchChunk = async (skus: string[], config: StoreApiConfig): Promise<StoreQuote[]> => {
  const url = `${config.baseUrl}/api/store/products?skus=${encodeURIComponent(skus.join(','))}`;
  const response = await fetch(url, {
    headers: { 'x-api-key': config.apiKey, accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`La API de la tienda respondió ${response.status}`);
  }
  const body = (await response.json()) as { products?: unknown };
  return Array.isArray(body.products) ? body.products.filter(isErpProduct).map(toQuote) : [];
};

/**
 * Pide precio y stock de los SKU al ERP. Los SKU que el ERP no conoce o que no
 * tienen precio no vienen en la respuesta. Tira si el ERP responde con error o
 * no hay red: quien llama decide qué mostrar.
 */
export const fetchStoreQuotes = async (
  skus: string[],
  config: StoreApiConfig,
): Promise<StoreQuote[]> => {
  const results = await Promise.all(chunk(skus).map((part) => fetchChunk(part, config)));
  return results.flat();
};
