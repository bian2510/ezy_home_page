import { describe, expect, it } from 'vitest';
import {
  blogImageSrcSet,
  extractHeadings,
  formatBlogDate,
  readingMinutes,
  slugifyHeading,
} from '@/features/blog/blogUtils';

describe('slugifyHeading', () => {
  it('should drop accents, punctuation and the leading number', () => {
    expect(slugifyHeading('1. ¿Qué es realmente la domótica?')).toBe(
      'que-es-realmente-la-domotica',
    );
  });

  it('should keep digits that are part of the text', () => {
    expect(slugifyHeading('2. Zigbee 3.0: red mallada')).toBe('zigbee-3-0-red-mallada');
  });
});

describe('extractHeadings', () => {
  it('should list the second-level headings in order, without emphasis marks', () => {
    const markdown =
      '# Título\n\nIntro\n\n## 1. Primero\n\ntexto\n\n### Sub\n\n## 2. **Segundo**\n';

    expect(extractHeadings(markdown)).toEqual([
      { id: 'primero', text: '1. Primero' },
      { id: 'segundo', text: '2. Segundo' },
    ]);
  });

  it('should return an empty list when there are no sections', () => {
    expect(extractHeadings('Solo un párrafo.')).toEqual([]);
  });
});

describe('readingMinutes', () => {
  it('should be at least one minute', () => {
    expect(readingMinutes('pocas palabras')).toBe(1);
  });

  it('should round up at 200 words per minute', () => {
    expect(readingMinutes(Array.from({ length: 401 }, () => 'palabra').join(' '))).toBe(3);
  });
});

describe('formatBlogDate', () => {
  it('should format an ISO date in es-AR without shifting the day', () => {
    expect(formatBlogDate('2026-05-01')).toBe('1 de mayo de 2026');
  });
});

describe('blogImageSrcSet', () => {
  it('should list the three widths of a cover exported to public/images/blog', () => {
    expect(blogImageSrcSet('/images/blog/foco-1024.webp')).toBe(
      '/images/blog/foco-640.webp 640w, /images/blog/foco-1024.webp 1024w, /images/blog/foco-1376.webp 1376w',
    );
  });

  it('should return undefined for an image without width variants', () => {
    expect(blogImageSrcSet('/images/blog/foto.jpg')).toBeUndefined();
  });
});
