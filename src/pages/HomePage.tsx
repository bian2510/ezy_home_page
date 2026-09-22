import { Link } from 'react-router-dom';
import { activeProducts } from '@/data/catalog';
import type { Product } from '@/types';
import { ProductGrid } from '@/features/catalog';
import HeroCarousel, { type HeroSlide } from '@/components/ui/HeroCarousel';
import { getWhatsAppNumber } from '@/lib/env';

/**
 * Categorías que se ofrecen como tarjetas: las que realmente tiene el catálogo
 * activo. Antes era una lista fija con slugs que no existían en
 * `products.json`, así que las tarjetas llevaban a un catálogo sin resultados.
 */
const categoryTiles = (items: Product[]): string[] => {
  const seen = new Set<string>();
  for (const product of items) {
    const category = product.category?.trim();
    if (category === undefined || category === '') continue;
    seen.add(category);
  }
  return Array.from(seen);
};

const HERO_SLIDES: readonly HeroSlide[] = [
  {
    heading: 'Domótica para tu hogar',
    subheading:
      'Iluminación inteligente, automatización y seguridad para el hogar argentino. Simple, confiable y al alcance de todos.',
    cta: { label: 'Ver catálogo', to: '/catalogo' },
  },
  {
    heading: 'Simple. Confiable. Argentino.',
    subheading:
      'No necesitás ser un experto. Te acompañamos en cada paso para que tu hogar inteligente sea una realidad.',
    cta: { label: 'Cómo comprar', to: '/como-comprar' },
  },
  {
    heading: 'Tecnología que transforma hogares',
    subheading:
      'Productos seleccionados para hogares argentinos de todos los perfiles. Desde una lamparita hasta un sistema completo.',
    cta: { label: 'Quiénes somos', to: '/quienes-somos' },
  },
];

export default function HomePage() {
  const bestsellers = activeProducts.filter((p) => p.isBestseller);
  const onSale = activeProducts.filter((p) => p.isOnSale);
  const whatsappHref = `https://wa.me/${getWhatsAppNumber()}`;

  return (
    <div className="flex flex-col gap-12 sm:gap-16">
      <HeroCarousel slides={HERO_SLIDES} label="Presentación EzyHome" />
      <ProductGrid
        id="mas-vendidos"
        heading="Más vendidos"
        products={bestsellers}
        emptyMessage="Próximamente sumamos nuestros productos más vendidos."
      />
      <ProductGrid
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

function CategoriesSection() {
  return (
    <section aria-labelledby="categorias-heading" className="flex flex-col gap-4">
      <h2 id="categorias-heading" className="text-2xl font-semibold text-foreground sm:text-3xl">
        Categorías
      </h2>
      <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-3">
        {categoryTiles(activeProducts).map((category) => (
          <li key={category}>
            <Link
              to={`/catalogo?category=${encodeURIComponent(category)}`}
              className="flex min-h-32 items-center justify-center rounded-lg border border-border bg-card px-4 py-8 text-center text-lg font-medium text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {category}
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
        <h2 id="whatsapp-cta-heading" className="text-2xl font-semibold sm:text-3xl">
          ¿Necesitás ayuda para elegir?
        </h2>
        <p className="text-base sm:text-lg">
          Escribinos por WhatsApp y te ayudamos a armar el kit ideal para tu hogar.
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
