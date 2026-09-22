# Patrones de Testing

**Stack:** Vitest · Testing Library · `@testing-library/user-event` · `@testing-library/jest-dom`

**Ver también:** [`docs/frontend-conventions.md`](../frontend-conventions.md) §9

---

## Regla base

Testear comportamiento observable, no implementación interna.

```ts
// ❌ MAL — testear estado interno
expect(result.current.isOpen).toBe(true);

// ✅ BIEN — testear lo que el usuario ve
expect(screen.getByRole('menu')).toBeVisible();
```

---

## Patrón 1 — Builder de datos de test

No duplicar objetos de datos en cada test.

- **Un solo archivo lo usa** → `buildX()` local en ese archivo.
- **Dos o más lo usan** → sube a [`tests/helpers/builders.ts`](../../tests/helpers/builders.ts),
  que hoy exporta `buildProduct`, `buildCartItem`, `buildBlogMeta` y `buildToast`.

```ts
import { buildProduct } from '../../helpers/builders';
```

Si un archivo necesita otros valores por defecto, envolver el builder compartido
en vez de copiar el objeto entero:

```ts
const buildProduct = (overrides: Partial<Product> = {}): Product =>
  buildBaseProduct({ name: 'Smart Bulb RGBW', price: 15000, ...overrides });
```

Usar `overrides` solo cuando el test necesita un valor específico:

```ts
const saleProduct = buildProduct({ isOnSale: true, promotionalPrice: 9000 });
```

---

## Patrón 2 — Wrapper para Context providers

Para testear hooks que consumen un Context, usar el `wrapper` de `renderHook`:

```ts
import type { ReactNode } from 'react';
import { CartProvider } from '@/features/cart';

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

const { result } = renderHook(() => useCart(), { wrapper });
```

Si el hook necesita varios providers (ej. Cart + Toast), anidarlos en el wrapper.

---

## Patrón 3 — `renderHook` + `act` para mutaciones de estado

Toda mutación de estado dentro de un test va envuelta en `act()`:

```ts
act(() => {
  result.current.addItem(buildProduct());
});

expect(result.current.items).toHaveLength(1);
```

**`act` vs `await act`:** usar `await act(async () => ...)` solo cuando la mutación dispara
efectos asíncronos (fetches, timers con promesas). Para estado síncrono, `act()` sin `await`.

---

## Patrón 4 — Mockear módulos con `vi.mock`

### Hook de Context (reemplazar la implementación completa)

```ts
const addItemMock = vi.fn();

vi.mock('@/features/cart/useCart', () => ({
  useCart: () => ({
    items: [],
    addItem: addItemMock,
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
    total: 0,
    itemCount: 0,
    storageAvailable: true,
  }),
}));
```

### react-router-dom (conservar real, reemplazar solo `useNavigate`)

```ts
import type * as RRD from 'react-router-dom';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof RRD>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});
```

### Datos JSON

```ts
vi.mock('@/data/products.json', () => ({
  default: [buildProduct({ id: '1' }), buildProduct({ id: '2' })],
}));
```

---

## Patrón 5 — Timers falsos

Para toasts, debounces, o cualquier comportamiento basado en tiempo:

```ts
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

it('toast desaparece después de 3 segundos', () => {
  act(() => {
    result.current.addToast('Mensaje');
  });
  expect(screen.getByText('Mensaje')).toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(3000);
  });
  expect(screen.queryByText('Mensaje')).not.toBeInTheDocument();
});
```

**Atención:** `userEvent` requiere timers reales. Si un test usa `userEvent` y el contexto tiene
timers falsos, llamar `vi.useRealTimers()` al inicio de ese test individual.

---

## Patrón 6 — Interacciones de usuario

Usar `userEvent` (simula comportamiento real del navegador), no `fireEvent` (dispara eventos DOM directos).

```ts
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();
await user.click(screen.getByRole('button', { name: /agregar al carrito/i }));
```

`userEvent` es asíncrono — siempre `await`.

---

## Patrón 7 — Testear que un Context lanza fuera del Provider

```ts
it('should throw when used outside CartProvider', () => {
  expect(() => renderHook(() => useCart())).toThrow(/CartProvider/);
});
```

Si React loguea el error en consola y el ruido molesta, silenciarlo en ese test:

```ts
const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
// ... test ...
consoleError.mockRestore();
```

---

## Patrón 8 — Precios con NBSP

`Intl.NumberFormat` para `es-AR` emite espacios no rompibles (U+00A0) entre símbolo y número.
Testing Library normaliza solo ASCII — `getByText('$ 12.500')` falla. Usar el matcher de precio:

```ts
import { formatPrice } from '@/lib/formatPrice';

const NBSP = / /g;
const normalize = (s: string) => s.replace(NBSP, ' ').trim();

const matchesPrice = (amount: number) => {
  const expected = normalize(formatPrice(amount));
  return (_: string, node: Element | null) => {
    if (!node) return false;
    if (normalize(node.textContent ?? '') !== expected) return false;
    return !Array.from(node.children).some(
      (child) => normalize(child.textContent ?? '') === expected,
    );
  };
};

screen.getByText(matchesPrice(12500));
```

---

## Dónde van los tests

| Qué se testea                     | Ruta del test                                       |
| --------------------------------- | --------------------------------------------------- |
| Componente en `ui/`               | `tests/components/ui/<Nombre>.test.tsx`             |
| Hook o Provider de una feature    | `tests/features/<feature>/<nombre>.test.ts(x)`      |
| Página                            | `tests/pages/<NombrePagina>.test.tsx`               |
| Función en `lib/`                 | `tests/unit/<nombre>.test.ts` (sin render, sin DOM) |
| Función en `features/xxx/utils`   | `tests/features/<feature>/<nombre>Utils.test.ts`    |
| Test de integración multi-feature | `tests/integration/<nombre>.test.tsx`               |
| Builders compartidos (no es test) | `tests/helpers/builders.ts`                         |

---

## Lo que NO se testea

- Clases CSS o estilos
- Estructura interna del DOM (cuántos `<div>` hay)
- Tipos de TypeScript (el compilador ya los verifica)
- Implementación interna de hooks (solo la interfaz pública)
