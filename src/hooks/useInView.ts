// `true` mientras el elemento está en pantalla, con IntersectionObserver.
//
// Arranca en `true` (la página se abre arriba, con el elemento a la vista) y,
// sin IntersectionObserver en el navegador, se queda así: lo que dependa de
// "salió de la pantalla" (la barra fija del detalle) simplemente no aparece.
import { useEffect, useState, type RefObject } from 'react';

export function useInView(ref: RefObject<Element>): boolean {
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (element === null || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (entry !== undefined) setInView(entry.isIntersecting);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return inView;
}
