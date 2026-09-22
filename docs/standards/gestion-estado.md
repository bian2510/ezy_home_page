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
| Filtros / paginación          | `useSearchParams`         | `?category=` en `CatalogPage`             |

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
export const CartProvider = ({ children }: { children: ReactNode }) => {
  // useReducer cuando las transiciones son varias y con reglas
  // (agregar, quitar, cambiar cantidad, vaciar); useState alcanza para estado
  // de una sola forma.
  const [items, dispatch] = useReducer(cartReducer, undefined, readPersistedItems);
  useEffect(() => {
    saveToStorage(items);
  }, [items]);
  // ...
};
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

Patrón actual en `CartProvider` — lectura perezosa al inicializar, escritura en
un efecto:

```ts
// Inicializar desde storage: cualquier fallo devuelve vacío, nunca tira
const readPersistedItems = (): CartItem[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isPersistedItem).map(reconcileWithCatalog);
  } catch {
    return [];
  }
};

const [items, dispatch] = useReducer(cartReducer, undefined, readPersistedItems);

// Sincronizar a storage
useEffect(() => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}, [items]);
```

Este patrón es obligatorio para cualquier estado que deba sobrevivir a un refresh (requisito de negocio: [`DOMAIN.md`](../../DOMAIN.md) § Operational Constraints).

**Tres reglas que salieron de bugs reales:**

1. **Validar la forma de lo persistido.** Un objeto guardado por una versión
   vieja puede no tener los campos que el código de hoy asume; una entrada
   inválida se descarta, no rompe el render.
2. **Reconciliar contra la fuente de verdad.** El carrito guarda un snapshot
   del producto: al hidratar se reemplaza por la versión vigente de
   `data/catalog.ts`, o el cliente compra a un precio viejo.
3. **Nunca vaciar sin acción del usuario.** Un ítem cuyo producto ya no está en
   el catálogo conserva su snapshot en vez de desaparecer.
