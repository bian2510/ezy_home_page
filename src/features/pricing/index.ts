// API pública de la feature `pricing`: precio y stock de la tienda desde el ERP.
// See docs/standards/modulos-feature.md.
export { PricingProvider } from './PricingProvider';
export { usePricing } from './usePricing';
export { default as ProductPrice } from './ProductPrice';
export { default as ConsultLink } from './ConsultLink';
export { isPurchasable, unavailableLabel } from './pricingUtils';
export type { PricingContextValue } from './PricingContext';
