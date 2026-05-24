// HomePage — landing route (`/`).
//
// Composes the storefront entry experience for visitors arriving from
// Instagram or Mercado Libre on mobile. Sections in order (PRD F001 BR-005,
// Task 012):
//   1. Hero            — headline, subheadline, primary CTA to /catalogo.
//   2. Más vendidos    — products flagged `isBestseller`, rendered as cards.
//   3. Ofertas         — products flagged `isOnSale`, rendered as cards.
//   4. Categorías      — three navigational tiles into /catalogo.
//   5. WhatsApp CTA    — opens the WhatsApp business chat in a new tab.
//
// Image strategy (BR-008): the hero image (when present) is fetched with
// `fetchpriority="high"` to win the LCP race; every other image (rendered
// inside `ProductCard`) uses `loading="lazy"`. Layout is mobile-first and
// must work at 360px without horizontal scroll, mirroring CatalogPage's
// `grid-cols-1 sm:grid-cols-2 md:grid-cols-3` rhythm.
//
// CartProvider is *not* mounted here; it wraps every route at the layout
// level (Task 014). `ProductCard` consumes `useCart`, so any test that
// mounts HomePage in isolation must stub `ProductCard` (see test file).
import { Link } from 'react-router-dom';
import productsData from '@/data/products.json';
import type { Product } from '@/types';
import ProductCard from '@/features/catalog/ProductCard';

const products = productsData as Product[];

interface CategoryTile {
  slug: string;
  label: string;
}

const CATEGORY_TILES: ReadonlyArray<CategoryTile> = [
  { slug: 'iluminacion', label: 'Iluminación' },
  { slug: 'automatizacion', label: 'Automatización' },
  { slug: 'seguridad', label: 'Seguridad' },
];

export default function HomePage() {
  const bestsellers = products.filter((p) => p.isBestseller);
  const onSale = products.filter((p) => p.isOnSale);
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER ?? '';
  const whatsappHref = `https://wa.me/${whatsappNumber}`;

  return (
    <div className="flex flex-col gap-12 sm:gap-16">
      <HeroSection />
      <ProductGridSection
        id="mas-vendidos"
        heading="Más vendidos"
        products={bestsellers}
        emptyMessage="Próximamente sumamos nuestros productos más vendidos."
      />
      <ProductGridSection
        id="ofertas"
        heading="Ofertas"
        products={onSale}
        emptyMessage="Por ahora no hay ofertas activas. Volvé pronto."
      />
      <CategoriesSection />
      <WhatsAppCtaSection href={whatsappHref} />
    </div>
  );
}

function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="rounded-lg bg-card px-4 py-10 text-center sm:px-8 sm:py-16"
    >
      <div className="mx-auto flex max-w-prose flex-col items-center gap-4">
        <h1
          id="hero-heading"
          className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl"
        >
          Domótica para tu hogar
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          Iluminación inteligente, automatización y seguridad para el hogar
          argentino. Simple, confiable y al alcance de todos.
        </p>
        <Link
          to="/catalogo"
          className="mt-2 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Ver catálogo
        </Link>
      </div>
    </section>
  );
}

interface ProductGridSectionProps {
  id: string;
  heading: string;
  products: Product[];
  emptyMessage: string;
}

function ProductGridSection({
  id,
  heading,
  products: items,
  emptyMessage,
}: ProductGridSectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <h2
        id={headingId}
        className="text-2xl font-semibold text-foreground sm:text-3xl"
      >
        {heading}
      </h2>
      {items.length === 0 ? (
        <p className="text-muted-foreground" role="status">
          {emptyMessage}
        </p>
      ) : (
        <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 md:grid-cols-3">
          {items.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CategoriesSection() {
  return (
    <section aria-labelledby="categorias-heading" className="flex flex-col gap-4">
      <h2
        id="categorias-heading"
        className="text-2xl font-semibold text-foreground sm:text-3xl"
      >
        Categorías
      </h2>
      <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-3">
        {CATEGORY_TILES.map(({ slug, label }) => (
          <li key={slug}>
            <Link
              to={`/catalogo?category=${slug}`}
              className="flex min-h-32 items-center justify-center rounded-lg border border-border bg-card px-4 py-8 text-center text-lg font-medium text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

interface WhatsAppCtaSectionProps {
  href: string;
}

function WhatsAppCtaSection({ href }: WhatsAppCtaSectionProps) {
  return (
    <section
      aria-labelledby="whatsapp-cta-heading"
      className="rounded-lg bg-primary px-4 py-10 text-center text-primary-foreground sm:px-8"
    >
      <div className="mx-auto flex max-w-prose flex-col items-center gap-4">
        <h2
          id="whatsapp-cta-heading"
          className="text-2xl font-semibold sm:text-3xl"
        >
          ¿Necesitás ayuda para elegir?
        </h2>
        <p className="text-base sm:text-lg">
          Escribinos por WhatsApp y te ayudamos a armar el kit ideal para tu
          hogar.
        </p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex min-h-11 items-center justify-center rounded-md bg-card px-6 py-2 text-sm font-medium text-primary transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-card"
        >
          Comprar por WhatsApp
        </a>
      </div>
    </section>
  );
}
