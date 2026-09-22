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
                  + index.ts obligatorio con la API pública
  hooks/        ← hooks genéricos sin dominio (useMediaQuery, useDebounce). Hoy vacío.
                  El hook consumidor de un context vive en SU feature (useCart, useToast).
  lib/          ← utilidades puras sin React (cn, env, formatPrice). Testeables sin render.
  pages/        ← páginas que no pertenecen a ninguna feature
  types/        ← interfaces y tipos compartidos entre features
  data/         ← datos estáticos (JSON, markdown) + catalog.ts, el acceso tipado
```

**Regla de dependencias — unidireccional, sin excepciones:**

```
pages → features → components/ui → lib
```

`ui/` nunca importa de `features/`. `lib/` nunca importa de React. Una feature se
consume por su `index.ts`, nunca por una ruta interna.

Estas reglas las aplica `eslint` por capa: cruzar una frontera falla `pnpm lint`.

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

## 6. Layout de páginas — estándar obligatorio

### Ancho de contenido

El token `max-w-content` (1200px, definido en `tailwind.config.ts`) es el **único ancho permitido**
para el contenedor que centra una página o sección. No usar `max-w-3xl`, `max-w-5xl`, ni anchos
arbitrarios para ese wrapper.

**Qué NO cuenta como wrapper de página:** limitar la medida de línea de un bloque de texto
_dentro_ de una sección ya contenida (copy de un hero, párrafo de un CTA, cuerpo de un artículo).
Ahí `max-w-prose` es correcto — es legibilidad, no layout de página.

```tsx
// ✅ CORRECTO — dentro del <main> de RootLayout
<section className="mx-auto w-full max-w-content px-4 py-8 sm:px-6 lg:px-8">

// ❌ MAL — ancho arbitrario
<div className="mx-auto max-w-prose flex flex-col gap-10">
<div className="mx-auto max-w-5xl ...">
```

**Usos legítimos de `max-w-prose` (65ch) hoy:** cuerpo del artículo en `BlogPostPage`,
copy del hero en `HeroCarousel`, texto del CTA de WhatsApp en `HomePage`.

### Secciones full-bleed

Para secciones que necesiten fondo de color o gradiente de borde a borde (ej. hero, CTA),
agregar `-mx-4 sm:-mx-6 lg:-mx-8` para romper el padding del contenedor padre:

```tsx
<section className="-mx-4 bg-sidebar px-4 py-16 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
```

---

## 7. Tailwind CSS

- Solo tokens de `tailwind.config.ts`. Sin hex literales en `className`.
- Sin `style={}` inline salvo valores dinámicos imposibles de expresar en Tailwind.
- **Mobile-first**: `base → sm: → md: → lg:`. Nunca al revés.
- Clases condicionales con `cn()` de `@/lib/cn`, no concatenación manual.
- **Tap targets mínimos**: `min-h-11` (44px) en todo elemento interactivo.

---

## 8. Accesibilidad (WCAG 2.1 AA — no negociable)

- `focus-visible:ring-2 focus-visible:ring-primary` en todo elemento interactivo.
- `aria-label` en botones/links sin texto visible.
- `aria-live="polite"` en regiones dinámicas (toasts, badges de carrito, errores).
- Contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande.
- HTML semántico: `<button>` para acciones, `<a>` para navegación. Nunca `<div onClick>`.
- `role="status"` en notificaciones no urgentes.

---

## 9. Testing — obligatorio, sin excepciones

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
- Función pura en `lib/` → test en `tests/unit/<nombre>.test.ts`, sin render ni DOM
- Todo cambio de comportamiento → test que lo cubra antes del commit
- Lógica pura en `lib/` → tests unitarios sin render

**No testear:** clases CSS, estructura interna del DOM, tipos de TypeScript.

**Builders compartidos en [`tests/helpers/builders.ts`](../tests/helpers/builders.ts)** —
`buildProduct`, `buildCartItem`, `buildBlogMeta`, `buildToast`. Un `buildX()` local es correcto
mientras lo use un solo archivo; con dos, sube al helper:

```ts
export const buildProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'p-1',
  name: 'Foco Inteligente',
  description: 'Foco LED Wi-Fi 9W',
  price: 12500,
  images: ['/images/foco.jpg'],
  category: 'Iluminación Inteligente',
  isBestseller: false,
  isOnSale: false,
  active: true,
  ...overrides,
});
```

**Patrón AAA** en cada test: Arrange → Act → Assert.

---

## 9 bis. Rutas, carga por demanda y errores

- **Toda ruta nueva se monta con `lazy()` + `<Suspense fallback={<RouteFallback />}>`**
  en `App.tsx`. Las únicas excepciones son la landing y el 404, que viajan en el bundle
  inicial porque son la primera pantalla.
- El `import()` apunta al `index.ts` de la feature (`import('@/features/catalog')`),
  nunca a un archivo interno.
- El fallback de carga lleva `role="status"` y un nombre accesible: el lector de
  pantalla tiene que enterarse de que algo está cargando.
- **`ErrorBoundary` envuelve el `<Outlet />` en `RootLayout`**, no la app entera: si
  una página revienta, el header, el carrito y el footer siguen en pie y el visitante
  puede seguir navegando. La `key={location.pathname}` lo remonta al cambiar de ruta,
  para que el error no quede pegado.
- Una excepción de render sin boundary deja la pantalla en blanco. Para una tienda
  cuyo riesgo #1 es la confianza visual (DOMAIN.md › Risk Posture), eso es perder la
  venta y al visitante.

---

## 10. Nomenclatura

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

## 11. Prohibiciones explícitas

- ❌ Wrappers de página/sección con ancho distinto a `max-w-content` (ver sección 6)
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
