// QuantitySelector — controlled numeric stepper for selecting an item quantity.
//
// Used by the product detail page (and any future "add to cart" surface) to
// pick how many units a visitor wants before adding to the cart. The
// decrement button is disabled once `value === min` so the invariant
// "quantity >= 1" can never be violated from the UI. With `max` (stock del
// ERP que queda para el carrito) the increment is disabled at the top.
//
// All buttons satisfy the 44px mobile tap target requirement (`min-h-11`)
// from DOMAIN.md › Design Implications. Estilo del mock del detalle: fondo
// `surface-container` y botones blancos.
interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  /** Tope opcional: el botón de sumar se deshabilita al llegar. */
  max?: number | undefined;
}

const DEFAULT_MIN = 1;

export default function QuantitySelector({
  value,
  onChange,
  min = DEFAULT_MIN,
  max,
}: QuantitySelectorProps) {
  const atMinimum = value <= min;
  const atMaximum = max !== undefined && value >= max;

  return (
    <div
      aria-label="Cantidad"
      className="inline-flex items-center gap-1 rounded-lg bg-surface-container p-1"
    >
      <button
        type="button"
        aria-label="Disminuir cantidad"
        onClick={() => onChange(value - 1)}
        disabled={atMinimum}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md bg-surface-container-lowest font-bold text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        −
      </button>
      <span
        aria-live="polite"
        className="w-12 text-center text-label-lg font-bold tabular-nums text-on-surface"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Aumentar cantidad"
        onClick={() => onChange(value + 1)}
        disabled={atMaximum}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md bg-surface-container-lowest font-bold text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        +
      </button>
    </div>
  );
}
