// Formateo de moneda. Vive en `lib/` porque es puro y ciego al dominio:
// recibe un number, no un Product (docs/standards/funciones-utils.md).

/**
 * Formatea un monto entero de ARS al estilo de moneda local argentino,
 * sin decimales (ej. 12500 -> "$ 12.500").
 *
 * `Intl.NumberFormat('es-AR', { style: 'currency' })` emits a non-breaking
 * space (U+00A0) between symbol and digits. That character is treated as
 * whitespace by Testing Library's default normalizer (`/\s+/g`) but is *not*
 * normalized in the matcher side, which breaks `getByText(formatPrice(x))`
 * round-trips. We post-process to a regular space so DOM text and matcher
 * compare equal after normalization, without changing the visible output.
 */
export const formatPrice = (amount: number): string =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\u00A0/g, ' ');
