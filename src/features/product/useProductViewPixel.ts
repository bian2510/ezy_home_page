// Avisa al Meta Pixel qué producto se vio (ViewContent), una sola vez por
// detalle y recién cuando el ERP respondió, para mandarlo con su precio.
import { useEffect, useRef } from 'react';
import type { Product, ProductPricing } from '@/types';
import { productPixelParams } from '@/features/pricing';
import { trackPixel } from '@/lib/metaPixel';

export function useProductViewPixel(product: Product, pricing: ProductPricing): void {
  const sent = useRef(false);
  const loading = pricing.availability === 'loading';

  useEffect(() => {
    if (sent.current || loading) return;
    sent.current = true;
    trackPixel('ViewContent', productPixelParams(product, pricing, 1));
  }, [loading, product, pricing]);
}
