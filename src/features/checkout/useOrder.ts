// Lee un pedido del ERP por su token para la página del pedido y, si hace
// falta, lo vuelve a consultar: `pollPlanFor` dice, con cada respuesta, cada
// cuánto y cuántas veces más (Mercado Pago: esperando el link o el pago).
import { useEffect, useRef, useState } from 'react';
import { getStoreApiKey, getStoreApiUrl } from '@/lib/env';
import type { PollPlan } from './mercadoPagoUtils';
import { OrderApiError, fetchOrder, type StoreOrder } from './ordersApi';

export type OrderState =
  | { status: 'loading' }
  /** `timedOut`: se consultó todas las veces del plan y el pedido no cambió. */
  | { status: 'ready'; order: StoreOrder; timedOut: boolean }
  | { status: 'not_found' }
  | { status: 'unavailable' };

const NO_POLLING = (): PollPlan | null => null;

export function useOrder(
  token: string,
  pollPlanFor: (order: StoreOrder) => PollPlan | null = NO_POLLING,
): OrderState {
  const [state, setState] = useState<{ token: string; value: OrderState }>({
    token,
    value: { status: 'loading' },
  });
  // El plan puede llegar en una función nueva en cada render: se usa la última
  // sin reiniciar la consulta.
  const planRef = useRef(pollPlanFor);
  useEffect(() => {
    planRef.current = pollPlanFor;
  }, [pollPlanFor]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let polls = 0;
    let lastOrder: StoreOrder | null = null;
    const config = { baseUrl: getStoreApiUrl(), apiKey: getStoreApiKey() };
    const show = (value: OrderState) => setState({ token, value });

    // Con un pedido ya leído: sigue consultando o avisa que se terminó el plan.
    const scheduleNext = (order: StoreOrder) => {
      const plan = planRef.current(order);
      const timedOut = plan !== null && polls >= plan.maxPolls;
      show({ status: 'ready', order, timedOut });
      if (plan === null || timedOut) return;
      polls += 1;
      timer = setTimeout(load, plan.intervalMs);
    };

    function load() {
      fetchOrder(token, config)
        .then((order) => {
          if (cancelled) return;
          lastOrder = order;
          scheduleNext(order);
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          // Una consulta que falla en medio no borra el pedido: se sigue con el plan.
          if (lastOrder !== null) return scheduleNext(lastOrder);
          const notFound = error instanceof OrderApiError && error.status === 404;
          show({ status: notFound ? 'not_found' : 'unavailable' });
        });
    }

    load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [token]);

  // Al cambiar de token, hasta que llegue la respuesta nueva se muestra "cargando".
  return state.token === token ? state.value : { status: 'loading' };
}
