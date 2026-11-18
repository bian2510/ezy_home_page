// TransferDiscountBadge — cartel con el descuento real por pagar con
// transferencia frente a Mercado Pago ("-5% transferencia"). Sale de los dos
// precios del ERP: si no hay descuento (Mercado Pago apagado, sin precio, o
// menos de 1 %) no se muestra nada. Nunca un descuento inventado.
import type { ProductPricing } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { transferDiscountPercent } from './pricingUtils';

interface TransferDiscountBadgeProps {
  pricing: ProductPricing;
  className?: string;
}

export default function TransferDiscountBadge({ pricing, className }: TransferDiscountBadgeProps) {
  const percent = transferDiscountPercent(pricing);
  if (percent === null) return null;

  return (
    <Badge variant="offer" className={className ?? ''}>
      {`-${percent}% transferencia`}
    </Badge>
  );
}
