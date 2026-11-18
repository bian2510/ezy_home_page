// ProductGallery — imagen grande y miniaturas de `images[]`. Con una sola
// imagen no hay miniaturas; sin imágenes, el placeholder "Sin imagen". Sobre
// la imagen va el descuento real por transferencia ("-5% transferencia").
//
// La imagen grande es el LCP del detalle: `fetchpriority="high"`, sin lazy.
import { useState } from 'react';
import type { Product, ProductPricing } from '@/types';
import { TransferDiscountBadge } from '@/features/pricing';
import { cn } from '@/lib/cn';
import { HIGH_FETCH_PRIORITY } from '@/lib/fetchPriority';

interface ProductGalleryProps {
  product: Product;
  pricing: ProductPricing;
}

export default function ProductGallery({ product, pricing }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = product.images[activeIndex] ?? null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-surface-container-lowest p-4 shadow-sm md:aspect-gallery">
        <span className="absolute left-4 top-4 z-10">
          <TransferDiscountBadge pricing={pricing} className="shadow-sm" />
        </span>
        {activeImage !== null ? (
          <img
            src={activeImage}
            alt={product.name}
            loading="eager"
            {...HIGH_FETCH_PRIORITY}
            className="h-full w-full object-contain"
          />
        ) : (
          <div
            role="img"
            aria-label="Sin imagen"
            className="flex h-full w-full items-center justify-center rounded-lg bg-surface-container text-body-md text-secondary"
          >
            Sin imagen
          </div>
        )}
      </div>

      {product.images.length > 1 && (
        <ul className="grid list-none grid-cols-5 gap-2 p-0">
          {product.images.map((src, index) => (
            <li key={src}>
              <button
                type="button"
                aria-label={`Imagen ${index + 1}`}
                aria-current={index === activeIndex}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg p-1.5 transition-all hover:-translate-y-0.5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  index === activeIndex
                    ? 'bg-surface-container-lowest shadow-sm ring-2 ring-primary'
                    : 'bg-surface-container',
                )}
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className="h-full w-full rounded object-contain"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
