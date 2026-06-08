// ProductDetailPage — /productos/:id route.
//
// Looks up a product in the static dataset by URL param and renders its
// gallery, description, price (with optional struck-through original price
// when on sale), a quantity stepper, and an "Agregar al carrito" CTA.
//
// Business rules (see DOMAIN.md › Product Core and spec.md BR-003):
// - URL propia por producto (`/productos/:id`).
// - Galería: cuando hay > 1 imagen mostramos tira de thumbnails; con 0
//   imágenes mostramos placeholder "Sin imagen".
// - Selector de cantidad mínima 1; el botón agregar dispara `addItem` con
//   el producto y la cantidad elegida.
// - ID inexistente => 404 con link de regreso al catálogo.
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import productsData from '@/data/products.json';
import type { Product } from '@/types';
import { formatPrice, getEffectivePrice } from '@/types';
import QuantitySelector from '@/components/ui/QuantitySelector';
import { useCart } from '@/features/cart/useCart';
import { useToast } from '@/hooks/useToast';

const products = productsData as Product[];

const MIN_QUANTITY = 1;

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const product = useMemo(() => products.find((p) => p.id === id && p.active), [id]);

  if (product === undefined) {
    return <ProductNotFound />;
  }

  return <ProductDetail product={product} />;
}

function ProductNotFound() {
  return (
    <section className="mx-auto w-full max-w-content space-y-4 px-4 py-12 text-center">
      <h1 className="text-3xl font-semibold text-foreground">404</h1>
      <p className="text-muted-foreground">
        El producto que buscás no existe o ya no está disponible.
      </p>
      <Link
        to="/catalogo"
        className="inline-flex min-h-11 items-center justify-center text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Volver al catálogo
      </Link>
    </section>
  );
}

interface ProductDetailProps {
  product: Product;
}

function ProductDetail({ product }: ProductDetailProps) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [quantity, setQuantity] = useState<number>(MIN_QUANTITY);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const handleAddToCart = () => {
    addItem(product, quantity);
    addToast(`${quantity > 1 ? `${quantity}x ` : ''}${product.name} agregado al carrito`);
  };

  const hasImages = product.images.length > 0;
  const hasMultipleImages = product.images.length > 1;
  const activeImage = hasImages ? product.images[activeImageIndex] : null;

  return (
    <section className="mx-auto w-full max-w-content px-4 py-6 sm:py-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          {activeImage !== null ? (
            <img
              src={activeImage}
              alt={product.name}
              className="aspect-square w-full rounded-md border border-border bg-card object-contain"
            />
          ) : (
            <div
              role="img"
              aria-label="Sin imagen"
              className="flex aspect-square w-full items-center justify-center rounded-md border border-border bg-muted text-sm text-muted-foreground"
            >
              Sin imagen
            </div>
          )}

          {hasMultipleImages && (
            <ul className="flex list-none gap-2 overflow-x-auto p-0">
              {product.images.map((src, index) => (
                <li key={src}>
                  <button
                    type="button"
                    aria-label={`Imagen ${index + 1}`}
                    aria-current={index === activeImageIndex}
                    onClick={() => setActiveImageIndex(index)}
                    className={`inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      index === activeImageIndex
                        ? 'border-primary'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{product.name}</h1>

          <div className="flex items-baseline gap-3">
            {product.isOnSale && product.promotionalPrice !== undefined && (
              <s className="font-mono text-base text-muted-foreground">
                {formatPrice(product.price)}
              </s>
            )}
            <p className="font-mono text-2xl font-semibold text-foreground">
              {formatPrice(getEffectivePrice(product))}
            </p>
          </div>

          <p className="text-base text-foreground/90">{product.description}</p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <QuantitySelector value={quantity} onChange={setQuantity} min={MIN_QUANTITY} />
            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
