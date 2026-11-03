// ScrollToTop — sube al principio de la página al cambiar de ruta.
//
// Solo cuando cambia el `pathname` y la navegación es nueva (PUSH o REPLACE):
// - Cambiar solo el query o el hash no mueve nada: la paginación y los filtros
//   del catálogo manejan su propio scroll.
// - "Atrás" y "adelante" (POP) no se tocan: el navegador restaura la posición.
// - Al cargar la página tampoco: decide el navegador.
//
// El sitio usa `BrowserRouter`, no un router de datos, así que el
// `ScrollRestoration` de react-router no aplica.
import { useEffect, useRef } from 'react';
import { NavigationType, useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const previous = useRef(pathname);

  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    if (navigationType !== NavigationType.Pop) window.scrollTo(0, 0);
  }, [pathname, navigationType]);

  return null;
}
