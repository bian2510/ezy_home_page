// Cotiza el envío a domicilio cuando la provincia, el CP y el carrito alcanzan
// (`quoteInput`), y vuelve a cotizar si cambia alguno. La cotización vale un
// rato en el ERP (2 h): `refresh` pide una nueva, por ejemplo si el pedido
// volvió con la cotización vencida.
//
// Sin opción, con error del ERP (404 mientras no haya envíos, 422 productos sin
// peso o medidas) o sin red, el estado es `unavailable` y el checkout ofrece
// WhatsApp (ADR-007). Si el CP no es de la provincia elegida, el estado es
// `wrong_postal_code`: se le pide al comprador que lo revise.
import { useCallback, useEffect, useState } from 'react';
import { getStoreApiKey, getStoreApiUrl } from '@/lib/env';
import {
  PostalCodeMismatchError,
  quoteShipping,
  type ShippingOption,
  type ShippingQuoteRequest,
} from './shippingApi';

export type QuoteState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; option: ShippingOption }
  | { status: 'unavailable' }
  /** El ERP dice que el CP no es de la provincia: que lo revise (o WhatsApp). */
  | { status: 'wrong_postal_code' };

export interface ShippingQuote {
  state: QuoteState;
  refresh: () => void;
}

const IDLE: QuoteState = { status: 'idle' };
const LOADING: QuoteState = { status: 'loading' };
const UNAVAILABLE: QuoteState = { status: 'unavailable' };

export function useShippingQuote(input: ShippingQuoteRequest | null): ShippingQuote {
  const [attempt, setAttempt] = useState(0);
  // Sin clave de la tienda no hay a quién preguntar: directo a WhatsApp.
  const configured = getStoreApiKey() !== '';
  const key = input === null || !configured ? null : `${attempt}:${JSON.stringify(input)}`;
  const [result, setResult] = useState<{ key: string; value: QuoteState } | null>(null);

  useEffect(() => {
    if (key === null || input === null) return;
    const controller = new AbortController();
    const show = (value: QuoteState) => setResult({ key, value });
    const config = { baseUrl: getStoreApiUrl(), apiKey: getStoreApiKey() };

    quoteShipping(input, config, controller.signal)
      .then((options) => {
        if (controller.signal.aborted) return;
        const [option] = options;
        show(option === undefined ? { status: 'unavailable' } : { status: 'ready', option });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof PostalCodeMismatchError) {
          show({ status: 'wrong_postal_code' });
          return;
        }
        console.warn('[envío] no se pudo cotizar', error);
        show({ status: 'unavailable' });
      });

    return () => controller.abort();
    // `key` resume `input` y el intento: el objeto `input` es nuevo en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const refresh = useCallback(() => setAttempt((current) => current + 1), []);

  if (input !== null && !configured) return { state: UNAVAILABLE, refresh };
  if (key === null) return { state: IDLE, refresh };
  return { state: result?.key === key ? result.value : LOADING, refresh };
}
