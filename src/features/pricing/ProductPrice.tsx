// ProductPrice — precio de venta del ERP para la card y el detalle.
//
// - Cargando: skeleton (nunca el precio del JSON).
// - Con precio: precio con Mercado Pago y, si es menor, el de transferencia;
//   "Sin stock" si el ERP no tiene unidades.
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

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'font-mono font-semibold text-foreground',
            isDetail ? 'text-2xl' : 'text-base',
          )}
        >
          {formatPrice(pricing.price)}
        </span>
        {pricing.availability === 'out_of_stock' && <Badge>Sin stock</Badge>}
      </div>
      {pricing.transferPrice !== null && (
        <span className={cn('text-muted-foreground', isDetail ? 'text-sm' : 'text-xs')}>
          <span className="font-mono">{formatPrice(pricing.transferPrice)}</span> con transferencia
        </span>
      )}
    </div>
  );
}
