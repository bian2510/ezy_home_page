/* eslint-disable @typescript-eslint/array-type */
import { useState, useEffect, useCallback } from 'react';
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

interface HeroSlide {
  heading: string;
  subheading: string;
  cta: { label: string; to: string };
}

const HERO_SLIDES: ReadonlyArray<HeroSlide> = [
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

const AUTOADVANCE_MS = 4500;

export default function HomePage() {
  const bestsellers = products.filter((p) => p.isBestseller);
  const onSale = products.filter((p) => p.isOnSale);
  const whatsappNumber = process.env.VITE_WHATSAPP_NUMBER ?? '';
  const whatsappHref = `https://wa.me/${whatsappNumber}`;

  return (
    <div className="flex flex-col gap-12 sm:gap-16">
      <HeroCarousel />
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

function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % HERO_SLIDES.length);
  }, []);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, AUTOADVANCE_MS);
    return () => clearInterval(timer);
  }, [paused, next]);

  const slide = HERO_SLIDES[current];

  return (
    <section
      aria-label="Presentación EzyHome"
      aria-roledescription="carrusel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative overflow-hidden rounded-lg bg-gradient-to-br from-sidebar to-sidebar-accent px-4 py-10 text-center sm:px-8 sm:py-16"
    >
      <div
        key={current}
        className="mx-auto flex min-h-[260px] max-w-prose animate-fade-slide flex-col items-center justify-center gap-4 sm:min-h-[320px]"
        aria-live="polite"
        aria-atomic="true"
      >
        <h1 className="text-3xl font-semibold tracking-tight text-sidebar-foreground sm:text-5xl">
          {slide?.heading}
        </h1>
        <p className="text-base text-sidebar-foreground/70 sm:text-lg">{slide?.subheading}</p>
        <Link
          to={slide?.cta.to ?? '/catalogo'}
          className="mt-2 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {slide?.cta.label}
        </Link>
      </div>

      <div
        role="tablist"
        aria-label="Slides"
        className="mt-8 flex items-center justify-center gap-2"
      >
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === current}
            aria-label={`Slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              i === current
                ? 'w-6 bg-primary'
                : 'w-2 bg-sidebar-foreground/30 hover:bg-sidebar-foreground/60'
            }`}
          />
        ))}
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
      <h2 id={headingId} className="text-2xl font-semibold text-foreground sm:text-3xl">
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
      <h2 id="categorias-heading" className="text-2xl font-semibold text-foreground sm:text-3xl">
        Categorías
      </h2>
      <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-3">
        {CATEGORY_TILES.map(({ slug, label }) => (
          <li key={slug}>
            <Link
              to={`/catalogo?category=${slug}`}
              className="flex min-h-32 items-center justify-center rounded-lg border border-border bg-card px-4 py-8 text-center text-lg font-medium text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
