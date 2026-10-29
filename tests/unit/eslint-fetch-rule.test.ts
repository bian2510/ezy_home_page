// La regla de `eslint.config.js` que deja la red solo en archivos `*Api.ts`
// (docs/standards/llamadas-al-backend.md). Sin este test, borrar o romper la
// regla no lo detecta nadie: `pnpm lint` pasa igual sobre el código actual.
// @vitest-environment node
import { ESLint } from 'eslint';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Con `CI=true`, typescript-eslint pasa a "single run" y parsea el archivo del
// disco en vez del texto de `lintText`: el test vería el código real, sin
// `fetch`, y pasaría o fallaría por la razón equivocada.
// Se restaura al terminar para no afectar a otros tests del mismo worker.
const previousSingleRun = process.env.TSESTREE_SINGLE_RUN;
beforeAll(() => {
  process.env.TSESTREE_SINGLE_RUN = 'false';
});
afterAll(() => {
  if (previousSingleRun === undefined) delete process.env.TSESTREE_SINGLE_RUN;
  else process.env.TSESTREE_SINGLE_RUN = previousSingleRun;
});

const eslint = new ESLint({ cwd: process.cwd() });

/** Líneas con error de red (una por llamada), en orden. */
const networkErrorLines = async (code: string, filePath: string): Promise<number[]> => {
  const [result] = await eslint.lintText(code, { filePath });
  const messages = result?.messages ?? [];
  // Un error de parseo deja la lista de reglas vacía y el test pasaría por la
  // razón equivocada: que falle mostrando el motivo.
  expect(messages.filter((message) => message.fatal).map((message) => message.message)).toEqual([]);
  return messages
    .filter((message) =>
      ['no-restricted-globals', 'no-restricted-properties'].includes(message.ruleId ?? ''),
    )
    .map((message) => message.line);
};

// Cada línea es una forma de usar la red; todas tienen que dar error.
const NETWORK_CALLS = `
export const a = () => fetch('https://erp.test');
export const b = () => window.fetch('https://erp.test');
export const c = () => globalThis.fetch('https://erp.test');
export const d = () => self.fetch('https://erp.test');
export const e = () => window['fetch']('https://erp.test');
export const f = () => new XMLHttpRequest();
export const g = () => new EventSource('https://erp.test');
export const h = () => new WebSocket('wss://erp.test');
export const i = () => navigator.sendBeacon('https://erp.test');
`;
// Las llamadas están en las líneas 2 a 10 del texto (la 1 está vacía).
const NETWORK_CALL_LINES = [2, 3, 4, 5, 6, 7, 8, 9, 10];

// Archivos reales del proyecto: el lint con tipos solo acepta archivos que
// están en el tsconfig.
const PLAIN_FILE = 'src/features/pricing/pricingUtils.ts';
const COMPONENT_FILE = 'src/features/catalog/ProductCard.tsx';
const API_FILE = 'src/features/pricing/storeApi.ts';

describe('regla de ESLint: la red solo en *Api.ts', () => {
  it('should reject every way of using the network in a plain .ts file', async () => {
    const lines = await networkErrorLines(NETWORK_CALLS, PLAIN_FILE);

    expect(lines).toEqual(NETWORK_CALL_LINES);
  }, 60_000);

  it('should reject every way of using the network in a component', async () => {
    const lines = await networkErrorLines(NETWORK_CALLS, COMPONENT_FILE);

    expect(lines).toEqual(NETWORK_CALL_LINES);
  }, 60_000);

  // Por ruta, sin parsear: el lint con tipos no acepta archivos inexistentes.
  it.each([
    ['src/lib/storeApi.ts', true],
    ['src/pages/fooApi.ts', true],
    ['src/features/pricing/nested/storeApi.ts', true],
    ['src/features/pricing/storeApi.tsx', true],
    ['src/features/pricing/notAnApiClient.ts', true],
    ['src/features/pricing/storeApi.ts', false],
    ['src/features/cart/cartApi.ts', false],
  ])('should apply the rule to %s: %s', async (filePath, restricted) => {
    const config = (await eslint.calculateConfigForFile(filePath)) as {
      rules: Record<string, unknown[]>;
    };
    const severity = config.rules['no-restricted-globals']?.[0];

    expect(severity === 2 || severity === 'error').toBe(restricted);
  });

  it('should allow the network inside an Api file', async () => {
    const lines = await networkErrorLines(NETWORK_CALLS, API_FILE);

    expect(lines).toEqual([]);
  }, 60_000);
});
