import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import HeroCarousel, { type HeroSlide } from '@/components/ui/HeroCarousel';

const slides: HeroSlide[] = [
  { heading: 'Primero', subheading: 'Sub uno', cta: { label: 'Ver catálogo', to: '/catalogo' } },
  {
    heading: 'Segundo',
    subheading: 'Sub dos',
    cta: { label: 'Cómo comprar', to: '/como-comprar' },
  },
  {
    heading: 'Tercero',
    subheading: 'Sub tres',
    cta: { label: 'Quiénes somos', to: '/quienes-somos' },
  },
];

const renderCarousel = (autoAdvanceMs?: number) =>
  render(
    <MemoryRouter>
      <HeroCarousel
        slides={slides}
        label="Presentación EzyHome"
        {...(autoAdvanceMs === undefined ? {} : { autoAdvanceMs })}
      />
    </MemoryRouter>,
  );

describe('HeroCarousel', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render the first slide as the h1 on mount', () => {
    renderCarousel();

    expect(screen.getByRole('heading', { name: 'Primero', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Sub uno')).toBeInTheDocument();
  });

  it('should render the CTA of the current slide as a link', () => {
    renderCarousel();

    expect(screen.getByRole('link', { name: 'Ver catálogo' })).toHaveAttribute('href', '/catalogo');
  });

  it('should render one tab per slide, with the current one selected', () => {
    renderCarousel();

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('should jump to the slide whose tab is clicked', async () => {
    const user = userEvent.setup();
    renderCarousel();

    await user.click(screen.getByRole('tab', { name: /slide 3/i }));

    expect(screen.getByRole('heading', { name: 'Tercero', level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')[2]).toHaveAttribute('aria-selected', 'true');
  });

  it('should advance to the next slide after the configured interval', () => {
    vi.useFakeTimers();
    renderCarousel(1000);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByRole('heading', { name: 'Segundo', level: 1 })).toBeInTheDocument();
  });

  it('should wrap around to the first slide after the last one', () => {
    vi.useFakeTimers();
    renderCarousel(1000);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByRole('heading', { name: 'Primero', level: 1 })).toBeInTheDocument();
  });

  it('should render an accessible region label', () => {
    renderCarousel();

    expect(screen.getByRole('region', { name: 'Presentación EzyHome' })).toBeInTheDocument();
  });
});
