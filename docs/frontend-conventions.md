# Convenciones Frontend — EzyHome

Stack: React 18 · TypeScript strict · Tailwind CSS · Vite · Vitest + Testing Library

Estas reglas aplican a todo código nuevo. No son sugerencias.

---

## 1. Organización de archivos

```
src/
  components/
    ui/         ← primitivos visuales puros, sin estado de negocio
    layout/     ← chrome de página (SiteHeader, SiteFooter). Máx 2-3 archivos.
  features/
    <nombre>/   ← todo lo de un dominio: context, provider, hook, subcomponentes, utils
  hooks/        ← hooks que consumen un context (useCart, useToast). Sin estado propio.
  lib/          ← utilidades puras sin React (cn, formatPrice). Testeables sin render.
  pages/        ← páginas que no pertenecen a ninguna feature
  types/        ← interfaces y tipos compartidos entre features
  data/         ← datos estáticos (JSON, markdown)
```

**Regla de dependencias — unidireccional, sin excepciones:**

```
pages → features → components/ui → lib
```

`ui/` nunca importa de `features/`. `lib/` nunca importa de React.

---

## 2. Componentes

- **Un componente = un archivo**, mismo nombre. No exportar múltiples componentes por archivo salvo helpers internos pequeños.
- **Props con interfaz nombrada**: `interface ButtonProps { ... }`, no inline.
- **Variantes con union types, no booleanos**: `variant: 'primary' | 'secondary'`, no `isPrimary: boolean`.
- **No prop drilling > 2 niveles**. Subir a Context o usar composición.
- **Componentes `ui/` son "dumb"**: reciben todo por props, no consumen Context de negocio.
- **Default exports para componentes, named exports para hooks y utils**.

---

## 3. TypeScript

- **Nunca `any`**. Usar `unknown` + type guards si el tipo es desconocido.
- **Props siempre tipadas** con `interface` (objetos) o `type` (unions/intersections).
- **Discriminated unions para estado complejo**:
  ```ts
  type LoadState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: Product[] }
    | { status: 'error'; error: string };
  ```
- **Return types explícitos en hooks**: `function useCart(): CartContextValue`.
- **`as const` para datos estáticos** (arrays de nav items, configs).

---

## 4. Estado — cuándo usar qué

| Situación                           | Solución                                  |
| ----------------------------------- | ----------------------------------------- |
| Estado local de un solo componente  | `useState`                                |
| Estado derivado                     | `useMemo`, nunca `useState` + `useEffect` |
| Compartido entre siblings           | Subir al padre o Context                  |
| Global de dominio (carrito, toasts) | Context + Provider + hook consumidor      |
| Estado del servidor (v2+)           | React Query o SWR                         |
| Filtros / paginación en URL         | `useSearchParams`                         |

**Anti-patrón crítico — nunca sincronizar estado con estado**:

```ts
// ❌ MAL
const [total, setTotal] = useState(0)
useEffect(() => { setTotal(items.reduce(...)) }, [items])

// ✅ BIEN
const total = useMemo(() => items.reduce(...), [items])
```

---

## 5. Hooks personalizados

- Extraer a hook cuando la lógica tiene > ~15 líneas o se repite en 2+ componentes.
- Un hook = una responsabilidad.
- **Patrón Context**:
  `Context.ts` (contrato) → `Provider.tsx` (estado + effects) → `useX.ts` (consumidor con error guard)
- `useEffect` con función de limpieza siempre que subscribe a algo externo.
- **Nunca `useEffect` para transformar datos** — usar `useMemo` o funciones puras.

---

## 6. Tailwind CSS

- Solo tokens de `tailwind.config.ts`. Sin hex literales en `className`.
- Sin `style={}` inline salvo valores dinámicos imposibles de expresar en Tailwind.
- **Mobile-first**: `base → sm: → md: → lg:`. Nunca al revés.
- Clases condicionales con `cn()` de `@/lib/cn`, no concatenación manual.
- **Tap targets mínimos**: `min-h-11` (44px) en todo elemento interactivo.

---

## 7. Accesibilidad (WCAG 2.1 AA — no negociable)

- `focus-visible:ring-2 focus-visible:ring-primary` en todo elemento interactivo.
- `aria-label` en botones/links sin texto visible.
- `aria-live="polite"` en regiones dinámicas (toasts, badges de carrito, errores).
- Contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande.
- HTML semántico: `<button>` para acciones, `<a>` para navegación. Nunca `<div onClick>`.
- `role="status"` en notificaciones no urgentes.

---

## 8. Testing — obligatorio, sin excepciones

**Testear comportamiento, no implementación.**

```ts
// ❌ MAL: testear implementación
expect(wrapper.state.isOpen).toBe(true);

// ✅ BIEN: testear comportamiento observable
expect(screen.getByRole('menu')).toBeVisible();
```

**Obligatorio:**

- Todo componente nuevo en `ui/` → test en `tests/components/ui/<Nombre>.test.tsx`
- Todo hook nuevo → test en `tests/features/<feature>/<hook>.test.ts` con `renderHook`
- Todo cambio de comportamiento → test que lo cubra antes del commit
- Lógica pura en `lib/` → tests unitarios sin render

**No testear:** clases CSS, estructura interna del DOM, tipos de TypeScript.

**Builders centralizados en `tests/helpers/builders.ts`** — no duplicar en cada archivo:

```ts
export const buildProduct = (overrides?: Partial<Product>): Product => ({
  id: 'test-id',
  name: 'Producto Test',
  price: 1000,
  description: '',
  images: [],
  category: 'iluminacion',
  ...overrides,
});
```

**Patrón AAA** en cada test: Arrange → Act → Assert.

---

## 9. Nomenclatura

| Cosa               | Convención                 | Ejemplo                 |
| ------------------ | -------------------------- | ----------------------- |
| Componentes        | PascalCase                 | `ProductCard.tsx`       |
| Hooks              | camelCase + `use`          | `useToast.ts`           |
| Contextos          | PascalCase + `Context`     | `ToastContext.ts`       |
| Providers          | PascalCase + `Provider`    | `ToastProvider.tsx`     |
| Utilidades puras   | camelCase                  | `cartUtils.ts`          |
| Event handlers     | `handle` + acción          | `handleAddToCart`       |
| Props de callbacks | `on` + acción              | `onQuantityChange`      |
| Booleanos          | `is/has/can` + descripción | `isLoading`, `hasItems` |

---

## 10. Prohibiciones explícitas

- ❌ `any` en TypeScript
- ❌ `console.log` en código de producción
- ❌ Lógica de negocio en componentes `ui/`
- ❌ CSS inline para estilos expresables con Tailwind
- ❌ Duplicar lógica que ya existe en `lib/` o en un hook
- ❌ Nuevo Context sin hook consumidor correspondiente
- ❌ `useEffect` para derivar estado (usar `useMemo`)
- ❌ Commit sin pasar el quality gate completo:

```bash
pnpm lint && pnpm typecheck && pnpm format:check && pnpm test
```
