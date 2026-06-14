# Reglas de Complejidad de Componentes

**Ver también:** [`docs/frontend-conventions.md`](../frontend-conventions.md) §2 · [`docs/standards/componentes-ui-vs-feature.md`](./componentes-ui-vs-feature.md)

---

## Props — límite concreto

**Máximo 5 props escalares en la interfaz de un componente.**

Si superás ese número, elegí una de estas dos salidas:

### Opción A — Agrupar en objeto de config

Cuando 3+ props comparten un prefijo semántico, colapsarlas en un objeto:

```ts
// ❌ 6 props → señal de alerta
interface BadgeProps {
  labelText: string;
  labelColor: string;
  labelSize: 'sm' | 'md';
  iconName: string;
  iconColor: string;
  iconSize: number;
}

// ✅ 2 props agrupadas
interface BadgeProps {
  label: { text: string; color: string; size: 'sm' | 'md' };
  icon: { name: string; color: string; size: number };
}
```

### Opción B — Dividir el componente

Si las props extra describen responsabilidades distintas (no solo datos relacionados), el componente está haciendo demasiado. Dividirlo.

---

## Líneas — señal de alerta

| Rango          | Acción                                                        |
| -------------- | ------------------------------------------------------------- |
| < 150 líneas   | Verde. No hay nada que hacer.                                 |
| 150–200 líneas | Evaluar si hay responsabilidades mezcladas. Puede quedar así. |
| > 200 líneas   | Dividir. Sin excepción. Ver "árbol de decisión" abajo.        |

Las líneas se cuentan incluyendo el JSX, los imports y los tipos locales. Imports de Tailwind no cuentan si están en `cn()` separados.

---

## Árbol de decisión — cuándo dividir

```
¿Una parte del componente se usa en otro lugar?
  → SÍ: extraerla a su propio componente en ui/ o en la feature.

¿Una parte tiene lógica compleja independiente (>15 líneas de JS, no JSX)?
  → SÍ: extraer a hook. Ver frontend-conventions.md §5.

¿El componente renderiza varias secciones visualmente distintas?
  → SÍ: cada sección puede ser un subcomponente interno.

¿El componente mezcla layout + lógica de negocio?
  → SÍ: separar el contenedor (lógica) del presentacional (layout).
```

---

## Componentes internos — cuándo están permitidos

Un componente auxiliar puede vivir en el mismo archivo si:

1. Tiene **menos de 30 líneas** de JSX + lógica.
2. **No se usa fuera** del componente padre de ese archivo.
3. **No tiene estado propio** (`useState`, `useRef`, etc.).

Si incumple cualquiera de los tres puntos, va a su propio archivo.

```tsx
// ✅ BIEN — helper pequeño, solo sirve a ProductCard
function PriceTag({ price }: { price: number }) {
  return <span className="text-lg font-bold">{formatPrice(price)}</span>;
}

export default function ProductCard({ product }: ProductCardProps) { ... }
```

---

## Cuándo NO dividir

No dividir por el solo hecho de que el número de líneas "se ve grande":

- Un componente con JSX largo pero **una sola responsabilidad** puede quedarse entero.
- Un Provider con `useState` + `useMemo` + handlers puede tener 150–180 líneas y ser correcto.

La métrica es la responsabilidad, no la cantidad de líneas. Las líneas son solo el indicador de alerta.
