// La regla de `eslint.config.js` que deja `fetch` solo en archivos `*Api.ts`
// (docs/standards/llamadas-al-backend.md). Sin este test, borrar o romper la
// regla no lo detecta nadie: `pnpm lint` pasa igual sobre el código actual.
// @vitest-environment node
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

// Con `CI=true`, typescript-eslint pasa a "single run" y parsea el archivo del
// disco en vez del texto de `lintText`: el test vería el código real, sin
// `fetch`, y pasaría o fallaría por la razón equivocada.
process.env.TSESTREE_SINGLE_RUN = 'false';

const eslint = new ESLint({ cwd: process.cwd() });

const fetchErrors = async (code: string, filePath: string): Promise<string[]> => {
  const [result] = await eslint.lintText(code, { filePath });
  const messages = result?.messages ?? [];
  // Un error de parseo deja la lista de reglas vacía y el test pasaría por la
  // razón equivocada: que falle mostrando el motivo.
  expect(messages.filter((message) => message.fatal).map((message) => message.message)).toEqual([]);
  return messages
    .filter((message) =>
      ['no-restricted-globals', 'no-restricted-properties'].includes(message.ruleId ?? ''),
    )
    .map((message) => message.ruleId ?? '');
};

const NETWORK_CALLS = `
export const a = () => fetch('https://erp.test');
export const b = () => window.fetch('https://erp.test');
export const c = () => globalThis.fetch('https://erp.test');
`;

describe('regla de ESLint: fetch solo en *Api.ts', () => {
  it('should reject fetch, window.fetch and globalThis.fetch outside an Api file', async () => {
    const errors = await fetchErrors(NETWORK_CALLS, 'src/features/pricing/pricingUtils.ts');

    expect(errors).toEqual([
      'no-restricted-globals',
      'no-restricted-properties',
      'no-restricted-properties',
    ]);
  }, 60_000);

  it('should allow fetch inside an Api file', async () => {
    const errors = await fetchErrors(NETWORK_CALLS, 'src/features/pricing/storeApi.ts');

    expect(errors).toEqual([]);
  }, 60_000);
});
