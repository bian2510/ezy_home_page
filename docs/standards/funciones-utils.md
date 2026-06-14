# Dónde Viven las Funciones

**Ver también:** [`docs/standards/capas-arquitectura.md`](./capas-arquitectura.md) · [`docs/frontend-conventions.md`](../frontend-conventions.md) §11

---

## Árbol de decisión — antes de escribir una función

```
¿La función usa React (hooks, JSX, contexto)?
  → NO corresponde a utils. Va en un componente o en un hook.

¿La función es pura y no conoce ningún dominio de EzyHome?
  → src/lib/

¿La función es pura pero conoce tipos del dominio (Product, CartItem...)?
  → src/features/<nombre>/utils.ts   (o <nombre>Utils.ts si la convención ya existe)

¿La función transforma o calcula a partir de un tipo específico?
  → Puede ir como función exportada en src/types/index.ts, cerca del tipo.
```

---

## `src/lib/` — utilidades sin dominio

Funciones puras que no conocen EzyHome. Reutilizables fuera del proyecto.

**Ejemplos válidos:** `cn()`, `formatPrice()`, `clamp()`, `slugify()`

**Regla:** si la función recibe un `Product` o un `CartItem`, no va aquí.

```ts
// src/lib/formatPrice.ts
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(amount);
}
```

Test obligatorio en `tests/lib/<nombre>.test.ts` — sin render, sin DOM.

---

## `src/features/<nombre>/utils.ts` — utilidades de dominio

Funciones puras que conocen los tipos del dominio de esa feature, pero no React.

**Ejemplos válidos:** `cartUtils.ts` (calcular total, formatear items), `catalogUtils.ts` (filtrar productos)

**No poner aquí:** side effects, llamadas a APIs, lógica de renderizado.

```ts
// src/features/cart/cartUtils.ts
export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
```

Test obligatorio en `tests/features/<feature>/<nombre>.test.ts`.

---

## `src/types/index.ts` — helpers acoplados al tipo

Funciones de transformación o cálculo que viven con el tipo que transforman. Solo cuando el helper no tiene sentido fuera del tipo.

**Ejemplos válidos:** `getEffectivePrice(product: Product): number`

---

## Regla anti-duplicación

**Antes de escribir cualquier función, buscar en este orden:**

1. `src/lib/` — ¿existe algo similar sin dominio?
2. `src/features/<nombre>/utils.ts` de la feature relevante
3. `src/types/index.ts`

Si encontrás lógica similar en dos archivos distintos → extraer a `lib/` o al utils de la feature.

```bash
# Buscar antes de escribir
grep -r "formatPrice\|calcular\|getEffective" src/lib/ src/features/
```

---

## Qué NO va en ningún utils

- Lógica con efectos secundarios (`localStorage`, `fetch`, eventos)
- Llamadas a APIs o hooks
- JSX o lógica de renderizado
- Constantes de configuración (van en el archivo que las consume o en `src/data/`)

---

## Resumen visual

```
src/
  lib/                         ← pura, sin dominio, reutilizable en cualquier proyecto
    cn.ts
    formatPrice.ts
  features/
    cart/
      cartUtils.ts             ← pura, conoce CartItem/Product
    catalog/
      catalogUtils.ts          ← pura, conoce Product/Category
  types/
    index.ts                   ← helpers acoplados al tipo que transforman
```
