import { describe, expect, it } from 'vitest';
import { getStoreApiKey } from '@/lib/env';

// Los tests corren con su propio entorno, no con el `.env.local` de quien los
// corre: el resultado no puede depender de la máquina y un test nunca puede
// llamar al ERP real. Ver vitest.config.ts y tests/setup.ts.
describe('entorno de los tests', () => {
  it('should run without the ERP key so nothing reaches the real ERP', () => {
    expect(getStoreApiKey()).toBe('');
  });

  it('should reject any request that a test did not mock', async () => {
    await expect(fetch('https://ezyhome.app/api/store/products')).rejects.toThrow(/sin mockear/i);
  });
});
