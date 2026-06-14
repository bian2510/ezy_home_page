# Estructura de un Módulo Feature

**Ver también:** [`docs/standards/capas-arquitectura.md`](./capas-arquitectura.md)

---

## Estructura de carpetas

```
src/features/<nombre>/
  components/         ← componentes que conocen este dominio
    ComponenteA.tsx
    ComponenteB.tsx
  hooks/              ← hooks específicos del dominio (opcional si hay pocos)
    useAlgo.ts
  <Nombre>Context.ts  ← contrato del contexto (si hay estado global)
  <Nombre>Provider.tsx← estado + efectos (si hay estado global)
  use<Nombre>.ts      ← hook consumidor con error guard (si hay contexto)
  <nombre>Utils.ts    ← funciones puras del dominio
  index.ts            ← API pública del módulo ← OBLIGATORIO
```

### Ejemplo real — `features/cart/`

```
features/cart/
  CartContents.tsx
  CartContext.tsx
  CartDrawer.tsx
  CartItem.tsx
  CartPage.tsx
  CartProvider.tsx
  cartUtils.ts
  useCart.ts          ← único punto de entrada al estado del carrito
```

---

## El contrato `index.ts`

Cada feature **debe** tener un `index.ts` que exporta solo lo que otras capas necesitan ver. Lo que no se exporta es privado.

```ts
// features/catalog/index.ts
export { default as ProductCard } from './ProductCard';
export { default as CatalogPage } from './CatalogPage';
export { default as CategoryFilter } from './CategoryFilter';
export { useCatalog } from './useCatalog';
// NO exportar: helpers internos, subcomponentes que solo usa CatalogPage
```

### Por qué importa

```ts
// ✅ BIEN — importar del contrato público
import { ProductCard } from '@/features/catalog';

// ❌ MAL — importar de ruta interna
import ProductCard from '@/features/catalog/ProductCard';
```

Si mañana renombrás `ProductCard.tsx` o lo movés a `components/`, solo cambia el `index.ts`. Los consumidores no se enteran.

---

## Reglas de encapsulamiento

1. **Componentes de página** (`pages/`) solo importan del `index.ts` de cada feature.
2. **Una feature no importa de otra feature directamente** — solo de su `index.ts`.
3. **Lo que no está en `index.ts` es un detalle de implementación** — puede cambiar sin aviso.
4. **Si no sabés si exportar algo**, no lo exportes. Es más fácil abrir el acceso que cerrarlo.

---

## Cuándo crear un módulo nuevo

- Hay 2+ componentes que comparten lógica del mismo dominio.
- Hay estado que necesita persistir entre rutas (contexto).
- Hay un conjunto de tipos, hooks y utils que pertenecen juntos semánticamente.

Ver el paso a paso en [`docs/guides/agregar-feature.md`](../guides/agregar-feature.md).

---

## Gestión de estado dentro de una feature

Ver [`docs/standards/gestion-estado.md`](./gestion-estado.md) para el patrón completo Context → Provider → hook y la decisión de cuándo migrar a Zustand.
