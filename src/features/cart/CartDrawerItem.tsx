// CartDrawerItem — fila compacta del carrito desplegado: foto, nombre, cantidad,
// el tacho para quitar y el total de la línea con el precio de transferencia
// (el mismo criterio que el total). Sin categoría ni precio unitario: eso queda
// para la fila de `/carrito` (`CartItem`).
import type { CartItem } from '@/types';
import { formatPrice } from '@/lib/formatPrice';
import { STOCK_LIMIT_MESSAGE } from '@/features/pricing';
import QuantitySelector from '@/components/ui/QuantitySelector';
import { useCartLine, type CartLineActions } from './useCartLine';

const MIN_QUANTITY = 1;

interface CartDrawerItemProps {
  item: CartItem;
  actions: CartLineActions;
}

export default function CartDrawerItem({ item, actions }: CartDrawerItemProps) {
  const { product, quantity } = item;
  const { linePrice, stock, atMaximum, changeQuantity, remove } = useCartLine(item, actions);

  return (
    <li className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-outline/10 bg-surface-container-low p-1.5 sm:h-20 sm:w-20">
        {product.images[0] !== undefined && (
          <img
            src={product.images[0]}
            alt=""
            loading="lazy"
            className="h-full w-full object-contain"
          />
        )}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-1">
          <p className="line-clamp-2 pt-1 text-label-lg font-bold text-on-surface">
            {product.name}
          </p>
          <button
            type="button"
            aria-label={`Quitar ${product.name} del carrito`}
            onClick={remove}
            className="-mr-2 -mt-1 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-secondary transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
          >
            <TrashIcon />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <QuantitySelector
            value={quantity}
            onChange={changeQuantity}
            min={MIN_QUANTITY}
            max={stock}
          />
          <p className="text-label-lg font-extrabold tabular-nums text-on-surface">
            {linePrice === null ? 'Consultar precio' : formatPrice(linePrice.line)}
          </p>
        </div>

        {atMaximum && (
          <p role="status" className="text-body-sm text-secondary">
            {STOCK_LIMIT_MESSAGE}
          </p>
        )}
      </div>
    </li>
  );
}

/** Tacho de basura, decorativo: el nombre del botón es su `aria-label`. */
function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="m14.74 9-.35 9m-4.79 0L9.26 9m9.97-3.21c.34.05.68.1 1.02.16m-1.02-.16-1.07 13.88a2.25 2.25 0 0 1-2.24 2.08H8.08a2.25 2.25 0 0 1-2.24-2.08L4.77 5.79m14.46 0a48.1 48.1 0 0 0-3.48-.4m-12 .56c.34-.06.68-.11 1.02-.16m0 0a48.1 48.1 0 0 1 3.48-.4m7.5 0v-.92c0-1.18-.91-2.16-2.09-2.2a52 52 0 0 0-3.32 0c-1.18.04-2.09 1.02-2.09 2.2v.92m7.5 0a48.7 48.7 0 0 0-7.5 0" />
    </svg>
  );
}
