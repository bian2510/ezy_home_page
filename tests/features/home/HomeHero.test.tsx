import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomeHero from '@/features/home/HomeHero';
import { HOME_HERO_IMAGE, type HeroImage } from '@/features/home/homeHeroImage';

const renderHero = (image?: HeroImage | null) =>
  render(
    <MemoryRouter>
      <HomeHero {...(image === undefined ? {} : { image })} />
    </MemoryRouter>,
  );

describe('HomeHero', () => {
  it('should use the site hero photo by default, decorative and loaded first (LCP)', () => {
    const { container } = renderHero();

    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute('src', HOME_HERO_IMAGE.src);
    expect(img).toHaveAttribute('srcset', HOME_HERO_IMAGE.srcSet);
    expect(img).toHaveAttribute('sizes', '100vw');
    // Decorativa: el H1 es el contenido, la foto no se lee.
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('fetchpriority', 'high');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  it('should fall back to the gradient when there is no image', () => {
    const { container } = renderHero(null);

    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should preload, only on the home, the same variants the hero renders', () => {
    // El preload vive en index.html (antes de que cargue el JS); si alguien
    // cambia las variantes en un lado y no en el otro, el navegador baja dos.
    const html = readFileSync(resolve(__dirname, '../../../index.html'), 'utf8');

    expect(html).toContain(`location.pathname === '/'`);
    expect(html).toContain(HOME_HERO_IMAGE.srcSet);
  });
});
