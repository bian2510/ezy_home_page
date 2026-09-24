// Helpers puros de SEO: título, canónica, recorte de description y JSON-LD.
// Son puros a propósito — el hook que los usa toca el DOM, y esa parte se
// prueba aparte en `useDocumentMeta.test.tsx`.
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SITE_URL,
  buildCanonical,
  buildProductJsonLd,
  buildTitle,
  truncateForMeta,
} from '../../src/lib/seo';

describe('buildTitle', () => {
  it('should append the brand to a page title', () => {
    expect(buildTitle('Catálogo')).toBe('Catálogo — EzyHome');
  });

  it('should fall back to the branded default when there is no page title', () => {
    expect(buildTitle()).toBe('EzyHome — Domótica para tu casa');
    expect(buildTitle('')).toBe('EzyHome — Domótica para tu casa');
  });

  it('should not repeat the brand when the page title already carries it', () => {
    expect(buildTitle('EzyHome')).toBe('EzyHome — Domótica para tu casa');
  });

  it('should collapse surrounding whitespace', () => {
    expect(buildTitle('  Carrito  ')).toBe('Carrito — EzyHome');
  });
});

describe('buildCanonical', () => {
  it('should join the site URL with the route', () => {
    expect(buildCanonical('https://ezyhome.com', '/catalogo')).toBe('https://ezyhome.com/catalogo');
  });

  it('should keep the root as a single slash', () => {
    expect(buildCanonical('https://ezyhome.com', '/')).toBe('https://ezyhome.com/');
  });

  it('should tolerate a trailing slash in the site URL', () => {
    expect(buildCanonical('https://ezyhome.com/', '/blog')).toBe('https://ezyhome.com/blog');
  });

  it('should tolerate a route without a leading slash', () => {
    expect(buildCanonical('https://ezyhome.com', 'blog')).toBe('https://ezyhome.com/blog');
  });

  it('should drop a trailing slash on a non-root route', () => {
    // Dos URLs para la misma página es exactamente lo que la canónica viene a
    // evitar: si la dejamos pasar, el trabajo se anula solo.
    expect(buildCanonical('https://ezyhome.com', '/catalogo/')).toBe(
      'https://ezyhome.com/catalogo',
    );
  });

  it('should drop the query string and the hash', () => {
    expect(buildCanonical('https://ezyhome.com', '/catalogo?categoria=Hubs#grilla')).toBe(
      'https://ezyhome.com/catalogo',
    );
  });
});

describe('truncateForMeta', () => {
  it('should leave a short description untouched', () => {
    expect(truncateForMeta('Sensor de gas WiFi')).toBe('Sensor de gas WiFi');
  });

  it('should cut a long description at a word boundary', () => {
    const largo = `${'palabra '.repeat(40)}final`;
    const recortado = truncateForMeta(largo);

    expect(recortado.length).toBeLessThanOrEqual(160);
    expect(recortado.endsWith('…')).toBe(true);
    expect(recortado).not.toContain('palabr…');
  });

  it('should collapse newlines and repeated spaces', () => {
    expect(truncateForMeta('Una\n\ndescripción   con   saltos')).toBe('Una descripción con saltos');
  });

  it('should honour a custom limit', () => {
    expect(truncateForMeta('uno dos tres cuatro', 10).length).toBeLessThanOrEqual(10);
  });
});

describe('buildProductJsonLd', () => {
  const entrada = {
    id: 'MLA2200632476',
    name: 'Plafón LED Inteligente 24W RGB con WiFi',
    description: 'Plafón regulable con control desde el celular.',
    images: ['/products/MLA2200632476/01.webp'],
    price: 85217,
    available: true,
  };
  const url = 'https://ezyhome.com/productos/MLA2200632476';

  it('should describe a Product with its offer', () => {
    const jsonLd = buildProductJsonLd(entrada, url);

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('Product');
    expect(jsonLd.name).toBe('Plafón LED Inteligente 24W RGB con WiFi');
    expect(jsonLd.sku).toBe('MLA2200632476');
  });

  it('should price the offer in ARS, which is what Google shows in the result', () => {
    const { offers } = buildProductJsonLd(entrada, url);

    expect(offers.price).toBe('85217');
    expect(offers.priceCurrency).toBe('ARS');
    expect(offers.url).toBe(url);
    expect(offers.availability).toBe('https://schema.org/InStock');
  });

  it('should mark an inactive product as out of stock', () => {
    const { offers } = buildProductJsonLd({ ...entrada, available: false }, url);

    expect(offers.availability).toBe('https://schema.org/OutOfStock');
  });

  it('should turn relative images into absolute URLs', () => {
    // Un `src` relativo en JSON-LD no le sirve a nadie: el consumidor no sabe
    // contra qué dominio resolverlo.
    const jsonLd = buildProductJsonLd(entrada, url);

    expect(jsonLd.image).toEqual(['https://ezyhome.com/products/MLA2200632476/01.webp']);
  });

  it('should omit the image key when the product has none', () => {
    const jsonLd = buildProductJsonLd({ ...entrada, images: [] }, url);

    expect(jsonLd.image).toBeUndefined();
  });

  it('should use the promotional price when the product is on sale', () => {
    const { offers } = buildProductJsonLd({ ...entrada, price: 45141 }, url);

    expect(offers.price).toBe('45141');
  });
});

describe('DEFAULT_SITE_URL', () => {
  it('should be an absolute https URL without a trailing slash', () => {
    expect(DEFAULT_SITE_URL).toMatch(/^https:\/\/[^/]+$/);
  });
});
