import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@/types';
import { formatPrice } from '@/types';
import { useCart } from '@/features/cart/useCart';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

/**
 * ProductCard — single product tile shown in the catalog grid.
 *
 * Behaviour (PRD F001 BR-002, Task 008):
 *  - Renders the first image of `images[]` with `loading="lazy"`. When the
 *    array is empty, a "Sin imagen" placeholder is shown instead of a
 *    broken `<img>` (Edge case #2).
 *  - The card body (image + name + price) is a real `<button>` that
 *    navigates to `/productos/:id` via `useNavigate`. We avoid wrapping
 *    the whole card in `<Link>` because the card contains a nested
 *    action button — nesting interactive elements is invalid HTML.
 *  - The "Agregar al carrito" button calls `useCart().addItem` and stops
 *    event propagation so it never triggers the card navigation. The
 *    button has `min-h-11` (44px) to satisfy the mobile tap-target rule
 *    in BR-008.
 *  - When `isOnSale`, the `originalPrice` is rendered struck-through and
 *    an "Oferta" badge (warning token) is shown. When `isBestseller`, a
 *    "Más vendido" badge (success token) is shown.
 */
interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const hasImage = product.images.length > 0;
  const primaryImage = hasImage ? product.images[0] : null;

  const handleNavigate = () => {
    navigate(`/productos/${product.id}`);
  };

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    // Prevent the card-body button's onClick from firing and navigating away.
    event.stopPropagation();
    addItem(product, 1);
  };

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border border-border bg-card text-foreground',
        'transition hover:shadow-md',
      )}
    >
      <button
        type="button"
        onClick={handleNavigate}
        aria-label={`Ver detalle de ${product.name}`}
        className={cn(
          'flex flex-1 cursor-pointer flex-col text-left',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        )}
      >
        <div className="relative aspect-square w-full bg-muted">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center text-sm text-muted-foreground"
            >
              Sin imagen
            </div>
          )}

          {(product.isOnSale || product.isBestseller) && (
            <div className="absolute left-2 top-2 flex flex-col gap-1">
              {product.isOnSale && <Badge variant="warning">Oferta</Badge>}
              {product.isBestseller && (
                <Badge variant="success">Más vendido</Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3">
          <h3 className="text-sm font-medium text-foreground">{product.name}</h3>

          <div className="flex items-baseline gap-2">
            <span className="font-mono text-base font-semibold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.isOnSale && product.originalPrice !== undefined && (
              <s className="font-mono text-xs text-muted-foreground">
                {formatPrice(product.originalPrice)}
              </s>
            )}
          </div>
        </div>
      </button>

      <div className="p-3 pt-0">
        <button
          type="button"
          onClick={handleAddToCart}
          className={cn(
            'inline-flex w-full min-h-11 items-center justify-center rounded-md',
            'bg-primary px-3 py-2 text-sm font-medium text-primary-foreground',
            'transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          )}
        >
          Agregar al carrito
        </button>
      </div>
    </article>
  );
}
