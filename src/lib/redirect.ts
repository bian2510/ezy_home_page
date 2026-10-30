// Salida del sitio a una página externa (el checkout de Mercado Pago). Vive
// acá para que los tests la reemplacen: jsdom no navega fuera del documento.

/** Lleva al comprador a `url` en la misma pestaña (queda en el historial). */
export const goToExternalUrl = (url: string): void => {
  window.location.assign(url);
};
