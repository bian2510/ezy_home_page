import { describe, expect, it } from 'vitest';
import { activeProducts, listCategories } from '@/data/catalog';
import { CATEGORY_DESCRIPTIONS } from '@/data/categoryDescriptions';

// Las tarjetas de categoría del Home muestran una bajada por categoría. Si
// aparece una categoría nueva en `products.json`, este test avisa que falta
// escribir la suya (la tarjeta igual se muestra, sin bajada).
describe('CATEGORY_DESCRIPTIONS', () => {
  it('should have a description for every category of the active catalog', () => {
    const missing = listCategories(activeProducts).filter(
      (category) => (CATEGORY_DESCRIPTIONS[category] ?? '').trim() === '',
    );

    expect(missing).toEqual([]);
  });
});
