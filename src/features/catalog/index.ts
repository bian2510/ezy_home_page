// API pública de la feature `catalog`.
// See docs/standards/modulos-feature.md.
export { default as CatalogPage } from './CatalogPage';
export { default as ProductCard } from './ProductCard';
export { default as CategoryFilter } from './CategoryFilter';
export { useCatalog } from './useCatalog';
export { countByCategory, outOfStockLast, selectRelatedProducts } from './catalogUtils';
export type { UseCatalogResult } from './useCatalog';
