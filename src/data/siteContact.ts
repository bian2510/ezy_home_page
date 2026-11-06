// Datos de contacto de la tienda, en un solo lugar. Confirmados por el dueño
// (2026-11-02). El link de WhatsApp no sale de acá: usa `VITE_WHATSAPP_NUMBER`
// (src/lib/env.ts), como el checkout.
export const SITE_CONTACT = {
  email: 'contacto.ezyhome@gmail.com',
  /** Como se muestra. */
  phone: '+54 9 11 24741036',
  /** Para el `tel:`, sin espacios. */
  phoneHref: '+5491124741036',
  location: 'CABA, Argentina',
  /** Instagram de la tienda, confirmado por el dueño (2026-11-06). */
  instagram: {
    handle: '@ezyhome.ar',
    url: 'https://www.instagram.com/ezyhome.ar/',
  },
} as const;
