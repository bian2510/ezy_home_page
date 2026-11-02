import type { MouseEvent } from 'react';
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
        'group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card text-foreground',
        'shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover',
      )}
    >
      <button
        type="button"
        onClick={handleNavigate}
        aria-label={`Ver detalle de ${product.name}`}
        className={cn(
          'flex flex-1 cursor-pointer flex-col text-left',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
        )}
      >
        <div className="relative aspect-square w-full overflow-hidden bg-card p-4">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center rounded bg-muted text-sm text-muted-foreground"
            >
              Sin imagen
            </div>
          )}

          <TransferDiscountBadge pricing={pricing} className="absolute left-3 top-3 shadow-card" />
        </div>

        <div className="flex flex-1 flex-col gap-1.5 border-t border-border p-4">
          {product.category && (
            <p className="text-label-sm font-bold uppercase text-muted-foreground">
              {product.category}
            </p>
          )}
          <h3 className="line-clamp-2 min-h-12 text-headline-sm font-bold text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>

          <div className="mt-auto pt-2">
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
                'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded',
                'bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-card',
                'transition hover:bg-primary-container active:scale-[0.99]',
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
