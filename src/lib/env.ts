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
