import { useId, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@/types';
import { useCart } from '@/features/cart';
import {
  ConsultLink,
  ProductPrice,
  STOCK_LIMIT_MESSAGE,
  TransferDiscountBadge,
  isPurchasable,
  reachedStockLimit,
  usePricing,
} from '@/features/pricing';
import { useToast } from '@/features/toast';
import Icon from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

/**
 * ProductCard — single product tile shown in the catalog grid.
 *
 * Behaviour (PRD F001 BR-002, Task 008):
 *  - Renders the first image of `images[]` with `loading="lazy"`. When the
 *    array is empty, a "Sin imagen" placeholder is shown instead of a
 *    broken `<img>` (Edge case #2).
 *  - The card body (image + category + name + price) is a real `<button>`
 *    that navigates to `/productos/:id` via `useNavigate`. We avoid wrapping
 *    the whole card in `<Link>` because the card contains a nested
 *    action button — nesting interactive elements is invalid HTML.
 *  - The "Agregar al carrito" button calls `useCart().addItem` and stops
 *    event propagation so it never triggers the card navigation. The
 *    button has `min-h-11` (44px) to satisfy the mobile tap-target rule
 *    in BR-008.
 *  - Price and stock come from the ERP (`usePricing`), never from the JSON.
 *    While loading the add button is disabled; without ERP price or stock it
 *    is replaced by a WhatsApp consult link. With all the ERP stock already in
 *    the cart the button is disabled with a friendly notice (no "Quedan N").
 *  - Sobre la imagen va el descuento real por transferencia ("-5%
 *    transferencia"), calculado con los dos precios del ERP. El cartel "Más
 *    vendido" no va en el rediseño (usuario, 2026-11-02).
 */
interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const labelId = useId();
  const { addItem, items } = useCart();
  const { addToast } = useToast();
  const pricing = usePricing().pricingOf(product);
  const inCart = items.find((item) => item.product.id === product.id)?.quantity ?? 0;
  const atStockLimit = reachedStockLimit(pricing, inCart);

  const primaryImage = product.images[0] ?? null;

  const handleNavigate = () => {
    void navigate(`/productos/${product.id}`);
  };

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    // Prevent the card-body button's onClick from firing and navigating away.
    event.stopPropagation();
    addItem(product, 1);
    addToast(`${product.name} agregado al carrito`);
  };

  return (
    <article
      className={cn(
        // Clases del mock: `bg-surface-container-lowest rounded-xl shadow-sm`,
        // sin borde, y al pasar `hover:shadow-xl hover:-translate-y-1`.
        'group relative flex h-full flex-col overflow-hidden rounded-xl bg-surface-container-lowest text-on-surface',
        'shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
      )}
    >
      <button
        type="button"
        onClick={handleNavigate}
        // El nombre accesible es "Ver detalle de" + nombre + descuento + precio:
        // con un `aria-label` fijo, el lector de pantalla no leía el descuento.
        aria-labelledby={`${labelId}-action ${labelId}-name ${labelId}-offer ${labelId}-price`}
        className={cn(
          'flex flex-1 cursor-pointer flex-col text-left',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
        )}
      >
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-surface-container-low p-6">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center rounded-lg bg-surface-container text-body-md text-secondary"
            >
              Sin imagen
            </div>
          )}

          <span id={`${labelId}-offer`} className="absolute left-3 top-3 z-10">
            <TransferDiscountBadge pricing={pricing} className="shadow-sm" />
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <span id={`${labelId}-action`} className="sr-only">
            Ver detalle de
          </span>
          {product.category && (
            <p className="mb-1.5 text-label-sm font-bold uppercase tracking-wider text-secondary">
              {product.category}
            </p>
          )}
          <h3
            id={`${labelId}-name`}
            className="line-clamp-2 min-h-12 text-headline-sm font-bold leading-snug text-on-surface transition-colors group-hover:text-primary"
          >
            {product.name}
          </h3>

          <div id={`${labelId}-price`} className="mt-auto pt-4">
            <ProductPrice pricing={pricing} />
          </div>
        </div>
      </button>

      <div className="p-4 pt-0">
        {isPurchasable(pricing.availability) || pricing.availability === 'loading' ? (
          <>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!isPurchasable(pricing.availability) || atStockLimit}
              className={cn(
                'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg',
                'bg-primary px-4 text-label-lg font-bold text-on-primary shadow-sm',
                'transition-all duration-200 hover:bg-primary-container active:scale-[0.98]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              <Icon name="cart" />
              Agregar al carrito
            </button>
            {atStockLimit && (
              <p role="status" className="mt-2 text-xs text-muted-foreground">
                {STOCK_LIMIT_MESSAGE}
              </p>
            )}
          </>
        ) : (
          <ConsultLink product={product} className="w-full" />
        )}
      </div>
    </article>
  );
}
