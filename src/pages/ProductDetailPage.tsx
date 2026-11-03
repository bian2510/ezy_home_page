// ProductDetailPage — /productos/:id route.
//
// Busca el producto por el id de la URL y arma el detalle con las piezas de
// `features/product` (rediseño 2026-11, mock del plafón): ruta de navegación,
// galería, panel de compra con los dos precios del ERP, descripción, "Mirá
// más productos" y, en el celular, la barra fija de compra.
//
// Reglas (DOMAIN.md › Product Core, spec.md BR-003):
// - URL propia por producto (`/productos/:id`); id inexistente o producto
//   inactivo => 404 con link al catálogo.
// - Precio y stock del ERP (`usePricing`), nunca del JSON; el JSON-LD publica
//   lo mismo que la página.
//
// Es una ruta de borde a borde (`FULL_BLEED_PREFIXES` en `RootLayout`): cada
// franja lleva su `Container`.
import { useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { findActiveProductById } from '@/data/catalog';
import type { Product } from '@/types';
import { getSiteUrl } from '@/lib/env';
import { buildCanonical, buildProductJsonLd, truncateForMeta } from '@/lib/seo';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { useInView } from '@/hooks/useInView';
import Container from '@/components/ui/Container';
import SectionBand from '@/components/ui/SectionBand';
import { usePricing } from '@/features/pricing';
import {
  ProductBreadcrumb,
  ProductDescription,
  ProductGallery,
  PurchasePanel,
  RelatedProducts,
  StickyPurchaseBar,
  usePurchase,
} from '@/features/product';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const product = useMemo(() => findActiveProductById(id), [id]);
  const path = `/productos/${id ?? ''}`;
  const { pricingOf } = usePricing();
  const pricing = product === undefined ? undefined : pricingOf(product);

  // El JSON-LD es lo que habilita que Google muestre el precio en el resultado,
  // en vez de solo el título. Si el id no existe, la página es un 404: no se
  // declara producto y se pide no indexarla.
  useDocumentMeta(
    product === undefined
      ? {
          title: 'Producto no encontrado',
          description: 'El producto que buscás no existe o ya no está disponible.',
          path,
          noIndex: true,
        }
      : {
          title: product.name,
          description: truncateForMeta(product.description),
          path,
          jsonLd: buildProductJsonLd(
            {
              id: product.id,
              name: product.name,
              description: product.description,
              images: product.images,
              // Precio y stock del ERP, como en la página. Sin precio del ERP
              // no se publica oferta (nunca un precio del JSON).
              offer:
                pricing?.price === undefined || pricing.price === null
                  ? null
                  : { price: pricing.price, available: pricing.availability === 'available' },
            },
            buildCanonical(getSiteUrl(), path),
          ),
        },
  );

  if (product === undefined) {
    return <ProductNotFound />;
  }

  return <ProductDetail product={product} />;
}

function ProductNotFound() {
  return (
    <Container className="space-y-4 py-12 text-center">
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
    </Container>
  );
}

interface ProductDetailProps {
  product: Product;
}

function ProductDetail({ product }: ProductDetailProps) {
  const purchase = usePurchase(product);
  // La barra fija del celular aparece cuando el botón principal sale de pantalla.
  const actionsRef = useRef<HTMLDivElement>(null);
  const actionsInView = useInView(actionsRef);

  return (
    <div className="flex flex-col">
      <ProductBreadcrumb product={product} />

      <SectionBand label={product.name} tone="surface" className="py-6 md:py-8">
        {/* En el celular: galería, compra, descripción. Desde `lg`, la compra
            va a la derecha y ocupa las dos filas. */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <ProductGallery product={product} pricing={purchase.pricing} />
          </div>
          <PurchasePanel product={product} purchase={purchase} actionsRef={actionsRef} />
          <div className="lg:col-span-7">
            <ProductDescription description={product.description} />
          </div>
        </div>
      </SectionBand>

      <RelatedProducts product={product} />

      {!actionsInView && <StickyPurchaseBar product={product} purchase={purchase} />}
    </div>
  );
}
