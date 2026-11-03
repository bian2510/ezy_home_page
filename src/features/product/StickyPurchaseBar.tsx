// StickyPurchaseBar — barra de compra fija abajo, solo en el celular (`md:hidden`).
//
// Aparece cuando el botón principal sale de la pantalla (lo decide la página
// con `useInView`). Hace lo mismo que el panel (`usePurchase`): misma cantidad,
// mismo tope de stock; sin precio o sin stock ofrece "Consultar" por WhatsApp.
//
// Es `sticky` al final de la página, no `fixed`: ocupa su propio lugar en el
// flujo, así nunca tapa contenido ni el footer, y respeta el área segura del
// iPhone (`pb-safe-bottom`).
import type { Product } from '@/types';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import { ConsultLink, unavailableLabel } from '@/features/pricing';
import { formatPrice } from '@/lib/formatPrice';
import type { Purchase } from './usePurchase';

interface StickyPurchaseBarProps {
  product: Product;
  purchase: Purchase;
}

function BarPrice({ purchase }: { purchase: Purchase }) {
  const { pricing } = purchase;
  if (pricing.availability === 'loading') {
    return (
      <span
        aria-label="Cargando precio"
        className="block h-6 w-24 animate-pulse rounded bg-muted"
      />
    );
  }
  if (pricing.price === null) {
    return (
      <span className="text-label-lg text-secondary">{unavailableLabel(pricing.availability)}</span>
    );
  }
  // Con Mercado Pago activo, el de transferencia (el más barato), como la card.
  return (
    <span className="text-headline-sm font-extrabold tabular-nums text-on-surface">
      {formatPrice(pricing.transferPrice ?? pricing.price)}
    </span>
  );
}

export default function StickyPurchaseBar({ product, purchase }: StickyPurchaseBarProps) {
  return (
    <aside
      aria-label="Compra rápida"
      className="sticky bottom-0 z-40 animate-slide-in-up bg-surface-container-lowest pb-safe-bottom shadow-sticky-bar md:hidden"
    >
      <Container className="flex items-center justify-between gap-4 py-3">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-body-sm text-on-surface-variant">{product.name}</span>
          <BarPrice purchase={purchase} />
        </div>
        {purchase.showsBuyButton ? (
          <button
            type="button"
            onClick={purchase.add}
            disabled={!purchase.canAdd}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-primary px-6 text-label-lg font-bold text-on-primary shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="cart" className="h-4 w-4" />
            Agregar
          </button>
        ) : (
          <ConsultLink product={product} label="Consultar" className="shrink-0 rounded-lg px-5" />
        )}
      </Container>
    </aside>
  );
}
