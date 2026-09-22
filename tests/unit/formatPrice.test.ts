import { describe, expect, it } from 'vitest';
import { formatPrice } from '@/lib/formatPrice';

const NBSP = ' ';

describe('formatPrice', () => {
  it('should format an integer amount as ARS currency', () => {
    expect(formatPrice(12500)).toContain('12.500');
    expect(formatPrice(12500).startsWith('$')).toBe(true);
  });

  it('should not emit decimals', () => {
    expect(formatPrice(12500)).not.toContain(',');
  });

  it('should use a regular space, never a non-breaking space', () => {
    // Testing Library normaliza espacios ASCII pero no U+00A0: un NBSP rompe
    // los round-trips `getByText(formatPrice(x))` de los tests de UI.
    expect(formatPrice(12500)).not.toContain(NBSP);
  });

  it('should format zero', () => {
    expect(formatPrice(0)).toContain('0');
  });

  it('should group thousands with a dot, es-AR style', () => {
    expect(formatPrice(1000000)).toContain('1.000.000');
  });

  it('should round an amount with decimals to whole pesos', () => {
    expect(formatPrice(12500.4)).toContain('12.500');
  });
});
