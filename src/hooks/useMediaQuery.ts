// `true` mientras se cumple una media query (`(min-width: 768px)`).
//
// Con `useSyncExternalStore`: se lee en el primer render (sin un cuadro con el
// valor equivocado) y se actualiza al cambiar el ancho. Sin `matchMedia` en el
// navegador da `false`: lo que dependa de esto tiene que funcionar igual en la
// versión angosta.
import { useCallback, useSyncExternalStore } from 'react';

const hasMatchMedia = (): boolean => typeof window.matchMedia === 'function';

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!hasMatchMedia()) return () => undefined;
      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    [query],
  );
  const getSnapshot = () => (hasMatchMedia() ? window.matchMedia(query).matches : false);

  return useSyncExternalStore(subscribe, getSnapshot);
}
