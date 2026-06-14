# Gestión de Estado — Patrones y Decisiones

**Ver también:** [`docs/adrs/F001-001-cart-state-react-context.md`](../adrs/F001-001-cart-state-react-context.md) · [`docs/standards/modulos-feature.md`](./modulos-feature.md)

---

## Cuándo usar qué

| Situación                     | Solución                  | Ejemplo en el repo                        |
| ----------------------------- | ------------------------- | ----------------------------------------- |
| Estado local de un componente | `useState`                | `activeImageIndex` en `ProductDetailPage` |
| Valor derivado de otro estado | `useMemo`                 | `total` del carrito calculado de `items`  |
| Compartido entre hermanos     | Subir al padre            | `quantity` entre stepper y botón agregar  |
| Global de un dominio          | Context + Provider + hook | `CartProvider` + `useCart`                |
| Estado del servidor (v2+)     | React Query o SWR         | — (no implementado)                       |
| Filtros / paginación          | `useSearchParams`         | — (pendiente en catalog)                  |

**Anti-patrón crítico — nunca sincronizar estado con estado:**

```ts
// ❌ MAL
const [total, setTotal] = useState(0)
useEffect(() => { setTotal(items.reduce(...)) }, [items])

// ✅ BIEN
const total = useMemo(() => items.reduce(...), [items])
```

---

## Patrón Context — tres archivos, tres responsabilidades

```
<Nombre>Context.ts   → define la interfaz (qué expone el contexto)
<Nombre>Provider.tsx → implementa el estado y los efectos
use<Nombre>.ts       → hook consumidor con error guard
```

### Ejemplo completo — carrito

```ts
// CartContext.ts — solo el contrato
interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, qty: number) => void;
  removeItem: (id: string) => void;
  total: number;
}
export const CartContext = createContext<CartContextValue | null>(null);
```

```tsx
// CartProvider.tsx — solo la implementación
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadFromStorage());
  useEffect(() => {
    saveToStorage(items);
  }, [items]);
  // ...
}
```

```ts
// useCart.ts — solo el acceso seguro
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
```

**Por qué esta separación:** el hook es la interfaz pública. Si mañana la implementación migra a Zustand, solo cambia `CartProvider.tsx` y `useCart.ts`. Los consumidores (`ProductCard`, `CartDrawer`) no cambian.

---

## Regla del hook como interfaz

> Los componentes siempre consumen estado via el hook (`useCart`), nunca via el Context directamente (`useContext(CartContext)`).

Esto permite cambiar la implementación interna (Context → Zustand → Redux) sin tocar los consumidores.

---

## Cuándo migrar de Context a Zustand

Considerar Zustand cuando aparezca alguno de estos síntomas:

- Hay 3+ dominios de estado global independientes con re-renders cruzados.
- El estado del carrito necesita sincronizarse con un servidor (optimistic updates).
- Se necesita devtools de estado (time travel, log de acciones).
- Los re-renders del Provider afectan performance medible.

Cuando migrés, el cambio es quirúrgico: reemplazás `CartProvider.tsx` y `useCart.ts`, los consumidores quedan intactos.

---

## Persistencia en localStorage

Patrón actual en `CartProvider`:

```ts
// Inicializar desde storage
const [items, setItems] = useState<CartItem[]>(() => {
  try {
    return JSON.parse(localStorage.getItem('cart') ?? '[]');
  } catch {
    return [];
  }
});

// Sincronizar a storage
useEffect(() => {
  localStorage.setItem('cart', JSON.stringify(items));
}, [items]);
```

Este patrón es obligatorio para cualquier estado que deba sobrevivir a un refresh (requisito de negocio: [`DOMAIN.md`](../../DOMAIN.md) § Operational Constraints).
