// ProductPrice — precio de venta del ERP para la card y el detalle.
//
// - Cargando: skeleton (nunca el precio del JSON).
// - Con precio: si la transferencia es más barata, ese precio grande y el de
//   Mercado Pago abajo; si no, un solo precio. "Sin stock" si el ERP no tiene
//   unidades.
// - Sin precio del ERP: "Consultar precio".
import type { ProductPricing } from '@/types';
import { formatPrice } from '@/lib/formatPrice';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { unavailableLabel } from './pricingUtils';

interface ProductPriceProps {
  pricing: ProductPricing;
  size?: 'card' | 'detail';
}

export default function ProductPrice({ pricing, size = 'card' }: ProductPriceProps) {
  const isDetail = size === 'detail';

  if (pricing.availability === 'loading') {
    return (
      <span
        role="status"
        aria-label="Cargando precio"
        className={cn('block animate-pulse rounded bg-muted', isDetail ? 'h-8 w-40' : 'h-6 w-24')}
      />
    );
  }

  if (pricing.price === null) {
    return (
      <p className={cn('font-medium text-muted-foreground', isDetail ? 'text-lg' : 'text-sm')}>
        {unavailableLabel(pricing.availability)}
      </p>
    );
  }

  // Con transferencia más barata, ese es el precio grande y el de Mercado
  // Pago va abajo, chico (usuario, 2026-10-28).
  const hasTransfer = pricing.transferPrice !== null;
  const mainPrice = pricing.transferPrice ?? pricing.price;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <span data-testid="main-price" className="text-foreground">
          <span className={cn('font-mono font-semibold', isDetail ? 'text-2xl' : 'text-base')}>
            {formatPrice(mainPrice)}
          </span>
          {hasTransfer && (
            <span className={cn('ml-1', isDetail ? 'text-sm' : 'text-xs')}>con transferencia</span>
          )}
        </span>
        {pricing.availability === 'out_of_stock' && <Badge>Sin stock</Badge>}
      </div>
      {hasTransfer && (
        <span
          data-testid="secondary-price"
          className={cn('text-muted-foreground', isDetail ? 'text-sm' : 'text-xs')}
        >
          <span className="font-mono">{formatPrice(pricing.price)}</span> con Mercado Pago
        </span>
      )}
    </div>
  );
}
