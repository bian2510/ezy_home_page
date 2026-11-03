// OrderItems — los productos del pedido tal como los devuelve el ERP (nombre,
// cantidad y total de la línea) y el total. La foto sale de `products.json` por
// SKU; si no está, la fila va sin foto.
import { findProductBySku } from '@/data/catalog';
import { formatPrice } from '@/lib/formatPrice';
import type { StoreOrder } from './ordersApi';

export default function OrderItems({ order }: { order: StoreOrder }) {
  return (
    <section
      aria-labelledby="pedido-heading"
      className="flex flex-col gap-4 rounded-lg bg-surface-container-lowest p-4 shadow-sm md:p-6"
    >
      <h2 id="pedido-heading" className="text-headline-sm font-bold text-on-surface">
        Pedido N.º {order.number}
      </h2>
      <ul className="flex list-none flex-col gap-4 p-0">
        {order.items.map((item) => {
          const image = findProductBySku(item.sku)?.images[0];
          return (
            <li key={item.sku} className="flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-container">
                {image !== undefined && (
                  <img src={image} alt="" loading="lazy" className="h-full w-full object-contain" />
                )}
              </span>
              {/* En el celular el precio va abajo del nombre: los nombres son largos. */}
              <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <span className="text-label-lg font-bold text-on-surface">
                  {item.quantity} × {item.name}
                </span>
                <span className="shrink-0 text-label-lg font-bold tabular-nums text-primary sm:text-on-surface">
                  {formatPrice(item.lineTotal)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      <p
        data-testid="order-total"
        className="flex items-end justify-between gap-4 border-t border-surface-container pt-4 text-label-lg font-bold text-on-surface"
      >
        Total:{' '}
        <span className="text-headline-md font-extrabold tabular-nums text-primary">
          {formatPrice(order.total)}
        </span>
      </p>
    </section>
  );
}
