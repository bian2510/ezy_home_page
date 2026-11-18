// Reglas puras del detalle de producto. Sin React.

/** Cantidad a agregar y topes, según el stock del ERP y lo que ya hay en el carrito. */
export interface PurchaseLimits {
  /** Cantidad elegida, recortada al stock que queda. */
  quantity: number;
  /** Tope del selector de cantidad; `undefined` sin dato de stock. */
  max: number | undefined;
  /** El carrito ya tiene todo el stock: no se puede agregar más. */
  noneLeft: boolean;
  /** La cantidad elegida llega al stock que queda (aviso "Llegaste al máximo…"). */
  atStockLimit: boolean;
}

/**
 * Topes de compra: el stock del ERP menos lo que ya está en el carrito, sin
 * "Quedan N" (usuario, 2026-10-28). Sin dato de stock no hay tope. El mínimo
 * del selector es 1 aunque no quede nada: en ese caso el botón se deshabilita.
 */
export const resolvePurchase = (
  stock: number | undefined,
  inCart: number,
  selected: number,
): PurchaseLimits => {
  if (stock === undefined) {
    return { quantity: selected, max: undefined, noneLeft: false, atStockLimit: false };
  }
  const remaining = stock - inCart;
  const max = Math.max(remaining, 1);
  const quantity = Math.min(selected, max);
  return { quantity, max, noneLeft: remaining <= 0, atStockLimit: quantity >= remaining };
};
