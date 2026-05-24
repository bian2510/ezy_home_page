import productsData from '@/data/products.json';
import type { Product } from '@/types';
import ProductCard from '@/features/catalog/ProductCard';
import CategoryFilter from '@/features/catalog/CategoryFilter';
import { useCatalog } from '@/features/catalog/useCatalog';

const products = productsData as Product[];

/**
 * Catalog landing page (route `/catalogo`). Reads the static product dataset
 * from `src/data/products.json`, lets the visitor narrow by category, and
 * renders a responsive grid of `ProductCard`s.
 *
 * Mobile-first: 1 column at 360px, 2 at `sm`, 3 at `md` — see DOMAIN.md
 * › Design Implications and PRD F001 BR-008.
 */
export default function CatalogPage() {
  const { filtered, selectedCategory, setCategory, categories } =
    useCatalog(products);

  return (
    <section className="mx-auto w-full max-w-content px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold text-foreground sm:text-3xl">
        Catálogo
      </h1>

      <div className="mb-6">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setCategory}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground" role="status">
          No hay productos en esta categoría
        </p>
      ) : (
        <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
