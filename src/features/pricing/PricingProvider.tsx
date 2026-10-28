// PricingProvider — pide al ERP precio y stock de todo el catálogo activo una
// sola vez al cargar el sitio y lo deja en memoria.
//
// Si no hay clave o el ERP falla, los productos quedan en "Consultar precio":
// el `price` del JSON no se mantiene y no se muestra (decisión del usuario,
// 2026-10-28).
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { activeProducts } from '@/data/catalog';
import { getStoreApiKey, getStoreApiUrl, isMercadoPagoEnabled } from '@/lib/env';
import type { Product } from '@/types';
import { PricingContext, type PricingContextValue } from './PricingContext';
import { fetchStoreQuotes } from './storeApi';
import {
  findMissingSkus,
  indexQuotes,
  resolvePricing,
  type PricingStatus,
  type QuoteIndex,
} from './pricingUtils';

interface PricingState {
  status: PricingStatus;
  quotes: QuoteIndex;
}

const EMPTY: QuoteIndex = new Map();

export const PricingProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<PricingState>(() => ({
    status: getStoreApiKey() === '' ? 'unavailable' : 'loading',
    quotes: EMPTY,
  }));

  useEffect(() => {
    const apiKey = getStoreApiKey();
    if (apiKey === '') return;

    let cancelled = false;
    const skus = activeProducts.map((product) => product.sku);

    fetchStoreQuotes(skus, { baseUrl: getStoreApiUrl(), apiKey })
      .then((quotes) => {
        if (cancelled) return;
        const index = indexQuotes(quotes);
        const missing = findMissingSkus(activeProducts, index);
        if (missing.length > 0) {
          console.warn(`[precios] El ERP no devolvió estos SKU: ${missing.join(', ')}`);
        }
        setState({ status: 'ready', quotes: index });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.warn('[precios] No se pudo leer precio y stock del ERP', error);
        setState({ status: 'unavailable', quotes: EMPTY });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const mercadoPagoEnabled = isMercadoPagoEnabled();
  const pricingOf = useCallback(
    (product: Product) =>
      resolvePricing(product, state.status, state.quotes, { mercadoPagoEnabled }),
    [state, mercadoPagoEnabled],
  );

  const value = useMemo<PricingContextValue>(
    () => ({ status: state.status, pricingOf }),
    [state.status, pricingOf],
  );

  return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>;
};
