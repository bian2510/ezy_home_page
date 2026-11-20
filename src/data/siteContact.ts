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
  /**
   * Barrio del punto pick-up, confirmado por el dueño (2026-11-17). Se muestra
   * antes de elegir la entrega; la dirección exacta y el horario los manda el
   * ERP con el pedido creado.
   */
  pickupArea: { neighborhood: 'Caballito', city: 'CABA' },
  /**
   * Quién lleva el envío a domicilio, confirmado por el dueño (2026-11-20). En
   * minúscula porque va dentro de una frase. El precio lo pone el ERP: acá solo
   * se dice quién lo lleva.
   */
  shippingCarriers: 'en CABA, con mensajería propia a costo fijo; al resto del país, por Andreani',
  /** "Retiro en Caballito, CABA": así se nombra el retiro en todo el sitio. */
  pickupLabel: 'Retiro en Caballito, CABA',
  /**
   * Horario de atención, confirmado por el dueño (2026-11-06). Va fijo porque
   * el del ERP (`store_pickup_hours`) solo llega dentro de un pedido: si cambia
   * en el ERP, hay que cambiarlo también acá.
   */
  hours: 'Lunes a viernes de 10 a 18 h',
  /** Instagram de la tienda, confirmado por el dueño (2026-11-06). */
  instagram: {
    handle: '@ezyhome.ar',
    url: 'https://www.instagram.com/ezyhome.ar/',
  },
} as const;
