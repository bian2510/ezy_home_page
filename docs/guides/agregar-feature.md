# Guía: Agregar una Nueva Feature

**Ver también:** [`docs/standards/modulos-feature.md`](../standards/modulos-feature.md) · [`docs/standards/capas-arquitectura.md`](../standards/capas-arquitectura.md)

---

## Cuándo crear una feature nueva

- Hay 2+ componentes relacionados a un nuevo dominio.
- El dominio necesita estado compartido entre rutas.
- Hay lógica que no encaja en ninguna feature existente (`catalog`, `cart`, `blog`, `toast`).

---

## Paso a paso

### 1. Crear la carpeta del módulo

```bash
mkdir -p src/features/<nombre>
```

Usar kebab-case para el nombre: `wish-list`, `checkout`, `product-comparison`.

### 2. Crear los componentes del dominio

Estructura plana por defecto —así están `catalog`, `cart`, `blog` y `toast`:

```
src/features/<nombre>/
  ComponentePrincipal.tsx
```

Recién con más de ~6 archivos conviene agrupar en `components/` y `hooks/`
(ver [`modulos-feature.md`](../standards/modulos-feature.md)).

Ver [`docs/standards/componentes-ui-vs-feature.md`](../standards/componentes-ui-vs-feature.md) para confirmar que los componentes van aquí y no en `ui/`.

### 3. Si la feature necesita estado global: crear el trío Context

```
<Nombre>Context.ts    ← interfaz del contexto
<Nombre>Provider.tsx  ← estado + efectos
use<Nombre>.ts        ← hook consumidor con error guard
```

Ver el patrón completo con ejemplo en [`docs/standards/gestion-estado.md`](../standards/gestion-estado.md).

### 4. Registrar el Provider en `RootLayout.tsx` (solo si tiene contexto)

Los providers globales viven en el layout, no en `App.tsx` —`App.tsx` es solo
la tabla de rutas.

```tsx
// src/layouts/RootLayout.tsx
<ToastProvider>
  <CartProvider>
    <NuevoProvider>
      {' '}
      {/* ← agregar aquí, dentro de los providers existentes */}
      <SiteHeader />
      <Outlet />
    </NuevoProvider>
  </CartProvider>
</ToastProvider>
```

### 5. Crear el `index.ts` con la API pública

```ts
// src/features/<nombre>/index.ts
export { default as ComponentePrincipal } from './ComponentePrincipal';
export { useNombre } from './use<Nombre>';
// Solo lo que otras capas necesitan. Todo lo demás es privado.
```

`eslint` rechaza cualquier import a una ruta interna de otra feature, así que
sin `index.ts` la feature es inusable desde afuera.

### 6. Si la feature tiene páginas: agregar rutas en `App.tsx`

```tsx
// src/App.tsx — dentro del <Route element={<RootLayout />}>
<Route path="/nueva-seccion" element={<NuevaPagina />} />
```

La página se importa del `index.ts` de la feature, nunca de una ruta interna:

```tsx
import { NuevaPagina } from '@/features/<nombre>';
```

### 7. Escribir tests

```
tests/features/<nombre>/
  ComponentePrincipal.test.tsx
  use<Nombre>.test.ts
```

`tests/` espeja la estructura de `src/`. Usar los builders compartidos de
[`tests/helpers/builders.ts`](../../tests/helpers/builders.ts) (`buildProduct`,
`buildCartItem`, `buildBlogMeta`, `buildToast`); si la feature necesita datos
propios, empezar con un `buildX()` local y subirlo al helper recién cuando lo
use un segundo archivo. Ver los 8 patrones en
[`docs/standards/testing.md`](../standards/testing.md).

### 8. Quality gate antes de commitear

```bash
pnpm lint && pnpm typecheck && pnpm format:check
```

---

## Checklist rápido

- [ ] Carpeta `src/features/<nombre>/` creada (plana)
- [ ] `index.ts` con API pública
- [ ] Context/Provider/hook si hay estado global
- [ ] Provider registrado en `App.tsx` si corresponde
- [ ] Rutas agregadas si tiene páginas
- [ ] Tests escritos
- [ ] Quality gate en verde
