// Envío del pedido al ERP. Guarda el estado del envío y la clave del intento:
// mientras el comprador reintenta lo mismo (por ejemplo, después de una falla
// de red) se reusa la clave y el ERP no duplica el pedido; si cambia algún
// dato, es un intento nuevo con clave nueva (el ERP rechaza una clave reusada
// con otros datos).
import { useCallback, useRef, useState } from 'react';
import { getStoreApiKey, getStoreApiUrl } from '@/lib/env';
import { createOrder, type OrderRequest, type StoreOrder } from './ordersApi';

export type OrderDraft = Omit<OrderRequest, 'idempotencyKey'>;

export type SubmitResult = { order: StoreOrder } | { error: unknown };

export type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'failed'; error: unknown };

/** Clave de intento: letras, números y guiones (lo que acepta el ERP). */
const newAttemptKey = (): string =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `intento-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

export function useCreateOrder() {
  const [state, setState] = useState<SubmitState>({ status: 'idle' });
  const attempt = useRef<{ fingerprint: string; key: string } | null>(null);

  const submit = useCallback(async (draft: OrderDraft): Promise<SubmitResult> => {
    const fingerprint = JSON.stringify(draft);
    if (attempt.current?.fingerprint !== fingerprint) {
      attempt.current = { fingerprint, key: newAttemptKey() };
    }
    setState({ status: 'submitting' });
    try {
      const { order } = await createOrder(
        { ...draft, idempotencyKey: attempt.current.key },
        { baseUrl: getStoreApiUrl(), apiKey: getStoreApiKey() },
      );
      attempt.current = null;
      setState({ status: 'idle' });
      return { order };
    } catch (error) {
      setState({ status: 'failed', error });
      return { error };
    }
  }, []);

  return { state, submit };
}
