// Acceso a variables de entorno. Punto único de lectura para toda la app.
//
// Vite reemplaza `import.meta.env.VITE_*` en build time. `process.env` NO
// existe en el bundle del browser: leerlo desde un componente tira
// "process is not defined" en producción, aunque los tests en Node pasen.

/**
 * Número de WhatsApp de EzyHome (formato internacional, sin `+` ni espacios).
 * Devuelve string vacío cuando no está configurado, para que el link siga
 * siendo válido en desarrollo.
 *
 * See DOMAIN.md › How EzyHome Makes Money: el checkout v1 cierra por WhatsApp.
 */
export const getWhatsAppNumber = (): string => import.meta.env.VITE_WHATSAPP_NUMBER ?? '';
