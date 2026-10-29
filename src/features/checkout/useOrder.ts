// Lee un pedido del ERP por su token para la página del pedido.
import { useEffect, useState } from 'react';
import { getStoreApiKey, getStoreApiUrl } from '@/lib/env';
import { OrderApiError, fetchOrder, type StoreOrder } from './ordersApi';

export type OrderState =
  | { status: 'loading' }
  | { status: 'ready'; order: StoreOrder }
  | { status: 'not_found' }
  | { status: 'unavailable' };

export function useOrder(token: string): OrderState {
  const [state, setState] = useState<{ token: string; value: OrderState }>({
    token,
    value: { status: 'loading' },
  });

  useEffect(() => {
    let cancelled = false;
    fetchOrder(token, { baseUrl: getStoreApiUrl(), apiKey: getStoreApiKey() })
      .then((order) => {
        if (!cancelled) setState({ token, value: { status: 'ready', order } });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const notFound = error instanceof OrderApiError && error.status === 404;
        setState({ token, value: { status: notFound ? 'not_found' : 'unavailable' } });
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Al cambiar de token, hasta que llegue la respuesta nueva se muestra "cargando".
  return state.token === token ? state.value : { status: 'loading' };
}
