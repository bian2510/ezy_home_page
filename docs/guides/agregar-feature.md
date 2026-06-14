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
mkdir -p src/features/<nombre>/components
```

Usar kebab-case para el nombre: `wish-list`, `checkout`, `product-comparison`.

### 2. Crear los componentes del dominio

```
src/features/<nombre>/
  components/
    ComponentePrincipal.tsx
```

Ver [`docs/standards/componentes-ui-vs-feature.md`](../standards/componentes-ui-vs-feature.md) para confirmar que los componentes van aquí y no en `ui/`.

### 3. Si la feature necesita estado global: crear el trío Context

```
<Nombre>Context.ts    ← interfaz del contexto
<Nombre>Provider.tsx  ← estado + efectos
use<Nombre>.ts        ← hook consumidor con error guard
```

Ver el patrón completo con ejemplo en [`docs/standards/gestion-estado.md`](../standards/gestion-estado.md).

### 4. Registrar el Provider en `App.tsx` (solo si tiene contexto)

```tsx
// src/App.tsx
<CartProvider>
  <NuevoProvider>   {/* ← agregar aquí, dentro de los providers existentes */}
    <RouterProvider ... />
  </NuevoProvider>
</CartProvider>
```

### 5. Crear el `index.ts` con la API pública

```ts
// src/features/<nombre>/index.ts
export { default as ComponentePrincipal } from './components/ComponentePrincipal';
export { useNombre } from './use<Nombre>';
// Solo lo que otras capas necesitan. Todo lo demás es privado.
```

### 6. Si la feature tiene páginas: agregar rutas en `App.tsx`

```tsx
{ path: '/nueva-seccion', element: <NuevaPagina /> }
```

Las páginas (`src/pages/`) importan del `index.ts` de la feature, no de rutas internas.

### 7. Escribir tests

```
tests/features/<nombre>/
  ComponentePrincipal.test.tsx
  use<Nombre>.test.ts
```

Usar los builders de `tests/helpers/builders.ts`. Ver convenciones en [`docs/frontend-conventions.md`](../frontend-conventions.md) §9.

### 8. Quality gate antes de commitear

```bash
pnpm lint && pnpm typecheck && pnpm format:check
```

---

## Checklist rápido

- [ ] Carpeta `src/features/<nombre>/` creada
- [ ] `index.ts` con API pública
- [ ] Context/Provider/hook si hay estado global
- [ ] Provider registrado en `App.tsx` si corresponde
- [ ] Rutas agregadas si tiene páginas
- [ ] Tests escritos
- [ ] Quality gate en verde
