import { useContext } from 'react';
import { PricingContext, type PricingContextValue } from './PricingContext';

/** Precio y stock del ERP. Tira si falta el `PricingProvider`. */
export function usePricing(): PricingContextValue {
  const ctx = useContext(PricingContext);
  if (!ctx) throw new Error('usePricing must be used within PricingProvider');
  return ctx;
}
