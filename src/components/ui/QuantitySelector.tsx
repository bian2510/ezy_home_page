// QuantitySelector — controlled numeric stepper for selecting an item quantity.
//
// Used by the product detail page (and any future "add to cart" surface) to
// pick how many units a visitor wants before adding to the cart. The
// decrement button is disabled once `value === min` so the invariant
// "quantity >= 1" can never be violated from the UI.
//
// All buttons satisfy the 44px mobile tap target requirement (`min-h-11`)
// from DOMAIN.md › Design Implications.
interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

const DEFAULT_MIN = 1;

export default function QuantitySelector({
  value,
  onChange,
  min = DEFAULT_MIN,
}: QuantitySelectorProps) {
  const atMinimum = value <= min;

  return (
    <div
      aria-label="Cantidad"
      className="inline-flex items-center gap-2 rounded-md border border-border bg-card p-1"
    >
      <button
        type="button"
        aria-label="Disminuir cantidad"
        onClick={() => onChange(value - 1)}
        disabled={atMinimum}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        −
      </button>
      <span
        aria-live="polite"
        className="min-w-[2ch] text-center font-mono text-base text-foreground"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Aumentar cantidad"
        onClick={() => onChange(value + 1)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        +
      </button>
    </div>
  );
}
