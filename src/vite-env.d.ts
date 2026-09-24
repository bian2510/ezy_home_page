/// <reference types="vite/client" />

/**
 * Variables de entorno de la app. Solo las que el cliente puede leer — Vite
 * expone al bundle únicamente las que empiezan con `VITE_`.
 *
 * El acceso va siempre por `src/lib/env.ts`, nunca directo ni vía
 * `process.env` (que no existe en el browser).
 */
interface ImportMetaEnv {
  /** Número de WhatsApp de EzyHome en formato internacional, sin `+` ni espacios. */
  readonly VITE_WHATSAPP_NUMBER?: string;
  /** Dominio público del sitio, con esquema y sin barra final. */
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
