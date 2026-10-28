// PricingContext — contrato del precio y stock que vienen del ERP.
// El estado y la consulta viven en `PricingProvider`; se consume con
// `usePricing`.
import { createContext } from 'react';
import type { Product, ProductPricing } from '@/types';
import type { PricingStatus } from './pricingUtils';

export interface PricingContextValue {
  /** `loading` hasta que responde el ERP; `unavailable` si falló o no hay clave. */
  status: PricingStatus;
  /** Precio de venta y disponibilidad de un producto. */
  pricingOf: (product: Product) => ProductPricing;
}

export const PricingContext = createContext<PricingContextValue | null>(null);
