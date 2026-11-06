// Acceso a variables de entorno. Punto único de lectura para toda la app.
//
// Vite reemplaza `import.meta.env.VITE_*` en build time. `process.env` NO
// existe en el bundle del browser: leerlo desde un componente tira
// "process is not defined" en producción, aunque los tests en Node pasen.
import { DEFAULT_SITE_URL } from './seo';

/**
 * Número de WhatsApp de EzyHome (formato internacional, sin `+` ni espacios).
 * Devuelve string vacío cuando no está configurado, para que el link siga
 * siendo válido en desarrollo.
 *
 * See DOMAIN.md › How EzyHome Makes Money: el checkout v1 cierra por WhatsApp.
 */
export const getWhatsAppNumber = (): string => import.meta.env.VITE_WHATSAPP_NUMBER ?? '';

/**
 * Dominio público del sitio, sin barra final. Base de las URLs canónicas y
 * del JSON-LD.
 *
 * Entra por variable para que el día que haya dominio propio no haya que
 * tocar código: el build del CI y el sitemap leen la misma variable.
 */
export const getSiteUrl = (): string =>
  (import.meta.env.VITE_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/+$/, '');

/** Dominio del ERP cuando no se configura `VITE_STORE_API_URL`. */
const DEFAULT_STORE_API_URL = 'https://ezyhome.app';

/**
 * Base de la API de la tienda en el ERP (precio y stock por SKU), sin barra
 * final. En desarrollo se apunta al ERP local con `VITE_STORE_API_URL`.
 */
export const getStoreApiUrl = (): string => {
  // Vacía cuenta como no configurada: el CI la pasa vacía si no hay secret.
  const configured = import.meta.env.VITE_STORE_API_URL ?? '';
  return (configured === '' ? DEFAULT_STORE_API_URL : configured).replace(/\/+$/, '');
};

/**
 * Clave de la API de la tienda. Viaja en el bundle, así que es pública: solo
 * permite leer precio y stock, que ya se muestran en el sitio. Sin clave el
 * sitio muestra "Consultar precio".
 */
export const getStoreApiKey = (): string => import.meta.env.VITE_STORE_API_KEY ?? '';
