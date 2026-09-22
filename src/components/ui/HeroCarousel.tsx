import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

/** Un slide del carrusel: título, bajada y una llamada a la acción. */
export interface HeroSlide {
  heading: string;
  subheading: string;
  cta: { label: string; to: string };
}

interface HeroCarouselProps {
  slides: readonly HeroSlide[];
  /** Nombre accesible de la región (`aria-label`). */
  label: string;
  /** Milisegundos entre slides. El autoavance se pausa al pasar el mouse. */
  autoAdvanceMs?: number;
}

const DEFAULT_AUTOADVANCE_MS = 4500;

/**
 * Carrusel de portada. Vive en `ui/` porque es ciego al dominio: recibe los
 * slides ya armados y no conoce productos, carrito ni blog.
 */
export default function HeroCarousel({
  slides,
  label,
  autoAdvanceMs = DEFAULT_AUTOADVANCE_MS,
}: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, autoAdvanceMs);
    return () => clearInterval(timer);
  }, [paused, next, autoAdvanceMs]);

  const slide = slides[current];

  return (
    <section
      aria-label={label}
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
          to={slide?.cta.to ?? '/'}
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
        {slides.map((_, i) => (
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
