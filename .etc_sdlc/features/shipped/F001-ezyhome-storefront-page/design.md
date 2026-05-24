# Design: EzyHome Storefront Page (F001)

**Feature:** F001 — EzyHome Storefront Page  
**Spec:** `.etc_sdlc/features/active/F001-ezyhome-storefront-page/spec.md`  
**Architect author role:** SME + Engineer + PM  
**Status:** approved

---

## 1. Architecture Overview

EzyHome Storefront v1 es una SPA (Single Page Application) puramente cliente. No hay backend propio — todos los datos son JSON/Markdown estáticos. La única integración externa es WhatsApp vía URL scheme (`wa.me`).

### Capas

```
Browser
├── Pages (routing orchestrators)
│   ├── HomePage, CatalogPage, ProductDetailPage
│   ├── CartPage, BlogListPage, BlogPostPage, NotFoundPage
│   └── consumen → Features + CartContext
│
├── Features (domain logic)
│   ├── catalog/  → lee products.json, filtra, renderiza cards
│   ├── cart/     → CartContext (global), localStorage sync
│   └── blog/     → carga Markdown via import.meta.glob
│
├── Components/ui (primitivos sin lógica de dominio)
│   └── Button, Badge, QuantitySelector
│
├── Static Data (editado a mano por el dueño)
│   ├── src/data/products.json          # Product[]
│   └── src/data/blog/
│       ├── index.json                  # BlogMeta[]
│       └── *.md                        # contenido de cada post
│
└── External
    └── WhatsApp wa.me URL (checkout — sin API, sin clave)
```

### Routing (React Router DOM 6)

| Ruta | Página | Módulo |
|------|--------|--------|
| `/` | HomePage | pages |
| `/catalogo` | CatalogPage | catalog |
| `/productos/:id` | ProductDetailPage | catalog |
| `/carrito` | CartPage | cart |
| `/blog` | BlogListPage | blog |
| `/blog/:slug` | BlogPostPage | blog |
| `*` | NotFoundPage | pages |

### Reglas de capa

- **Pages** orchestran: reciben datos de hooks/context, pasan props hacia abajo. Sin lógica de dominio inline.
- **Features** encapsulan: lógica de dominio propia, hooks propios, tipos propios. No importan entre sí.
- **`ui/` components**: primitivos reutilizables sin lógica de dominio. Composables.
- **CartContext**: estado global singleton — el único estado compartido cross-page.
- **Static data**: sin fetching de red. `import()` estático o `import.meta.glob` para Markdown.

---

## 2. Data Model

```typescript
// src/types/index.ts

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;           // ARS, entero (sin centavos en UI)
  images: string[];        // paths relativos a public/; primer elemento = imagen principal
  category: string;        // 'iluminacion' | 'automatizacion' | 'seguridad'
  isBestseller: boolean;
  isOnSale: boolean;
  originalPrice?: number;  // definido solo cuando isOnSale === true
}

export interface CartItem {
  product: Product;
  quantity: number;        // invariante: siempre >= 1
}

export interface CartState {
  items: CartItem[];
}

export interface BlogMeta {
  slug: string;
  title: string;
  date: string;            // ISO 8601: "2026-05-24"
  image: string | null;    // path relativo a public/ o null
  excerpt?: string;
}

// src/data/blog/index.json = BlogMeta[]
// src/data/products.json   = Product[]
```

**Formato de precio en UI:**
```typescript
const formatPrice = (amount: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
// → "$15.000"
```

Sin librería externa de i18n para formato de número.

---

## 3. Module Structure

```
src/
├── types/
│   └── index.ts                    # Product, CartItem, CartState, BlogMeta
│
├── data/                           # archivos editados a mano
│   ├── products.json               # Product[]
│   └── blog/
│       ├── index.json              # BlogMeta[]
│       └── *.md                    # contenido de cada post
│
├── features/
│   ├── catalog/
│   │   ├── CatalogPage.tsx         # página /catalogo
│   │   ├── ProductCard.tsx         # card de producto
│   │   ├── CategoryFilter.tsx      # chips de filtro por categoría
│   │   └── useCatalog.ts           # hook: filtra products por categoría
│   │
│   ├── cart/
│   │   ├── CartContext.tsx         # Context + useReducer + localStorage sync
│   │   ├── CartProvider.tsx        # Provider — envuelve la app en RootLayout
│   │   ├── CartPage.tsx            # página /carrito
│   │   ├── CartItem.tsx            # fila de item (cantidad, precio, eliminar)
│   │   ├── useCart.ts              # hook de consumo del contexto
│   │   └── cartUtils.ts            # buildWhatsAppMessage()
│   │
│   └── blog/
│       ├── BlogListPage.tsx        # página /blog
│       ├── BlogPostPage.tsx        # página /blog/:slug
│       ├── BlogCard.tsx            # card de artículo en listado
│       └── useBlogPost.ts          # hook: carga .md por slug con import.meta.glob
│
├── pages/
│   ├── HomePage.tsx                # Hero + Más vendidos + Ofertas + Categorías + CTA
│   ├── ProductDetailPage.tsx       # /productos/:id (galería, cantidad, agregar)
│   └── NotFoundPage.tsx            # 404 (existe — conservar)
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx              # existe — actualizar a tokens EzyHome
│   │   ├── Badge.tsx               # "Oferta", "Más vendido"
│   │   └── QuantitySelector.tsx    # selector numérico (min 1, nunca 0)
│   └── layout/
│       ├── SiteHeader.tsx          # existe — agregar nav real + badge carrito
│       └── SiteFooter.tsx          # existe — agregar links reales
│
├── layouts/
│   └── RootLayout.tsx              # existe — envolver con CartProvider
│
├── lib/
│   └── cn.ts                       # existe — clsx/twMerge, conservar
│
└── App.tsx                         # agregar rutas: /catalogo, /productos/:id,
                                    # /carrito, /blog, /blog/:slug
```

---

## 4. Interface Contracts

### CartContext

```typescript
// src/features/cart/CartContext.tsx

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; quantity: number }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' };

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;  // default: 1
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void; // clamp >= 1
  clearCart: () => void;
  total: number;            // Σ (price * quantity)
  itemCount: number;        // Σ quantities — para badge en header
  storageAvailable: boolean; // false si localStorage bloqueado
}
```

**localStorage sync:**
```typescript
// En CartProvider: init desde localStorage, sync en cada cambio
const [state, dispatch] = useReducer(cartReducer, [], () => {
  try {
    const raw = localStorage.getItem('ezyhome_cart');
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
});

useEffect(() => {
  try {
    localStorage.setItem('ezyhome_cart', JSON.stringify(state.items));
  } catch {
    setStorageAvailable(false);
  }
}, [state.items]);
```

### useCatalog

```typescript
// src/features/catalog/useCatalog.ts

function useCatalog(products: Product[]): {
  filtered: Product[];
  selectedCategory: string | null;  // null = "Todos"
  setCategory: (cat: string | null) => void;
  categories: string[];             // lista única de categorías para los chips
}
```

### buildWhatsAppMessage

```typescript
// src/features/cart/cartUtils.ts

function buildWhatsAppMessage(items: CartItem[], phoneNumber: string): string;
// Pre: items.length > 0, phoneNumber non-empty
// Retorna: URL completa "https://wa.me/{phoneNumber}?text={encodeURIComponent(msg)}"
//
// Formato del mensaje:
// "Hola! Quiero hacer un pedido:
//  - 2x Smart Bulb RGBW → $15.000 c/u
//  - 1x Sensor de Gas → $8.500 c/u
//  Subtotal: $38.500
//  (Los precios no incluyen envío)"
```

### useBlogPost

```typescript
// src/features/blog/useBlogPost.ts

function useBlogPost(slug: string): {
  content: string | null;   // Markdown raw string
  meta: BlogMeta | null;
  notFound: boolean;
  loading: boolean;
}
// Carga via:
// const modules = import.meta.glob('../../data/blog/*.md', { query: '?raw', eager: false })
// Resuelve el módulo para el slug dado; si no existe → notFound: true
```

### localStorage schema

```
key:   "ezyhome_cart"
value: JSON.stringify(CartItem[])

Ejemplo:
[
  { "product": { "id": "sb-rgbw-001", "name": "Smart Bulb RGBW", "price": 15000, ... }, "quantity": 2 },
  { "product": { "id": "gas-det-001", "name": "Sensor de Gas", "price": 8500, ... }, "quantity": 1 }
]
```

---

## 5. Technical Constraints y resolución

| Constraint | Decisión |
|---|---|
| Mobile-first 360px+ | Tailwind: base = mobile. `sm:` (640px), `md:` (768px), `lg:` (1024px) solo para ampliar. Sin layout roto en 360px sin media query explícita. |
| LCP < 2.5s en 4G | Hero image: `fetchpriority="high"`, sin `loading="lazy"`. Resto: `loading="lazy"`. Fontsource bundleado. Vite: assets con hash → `Cache-Control: immutable`. |
| Tap targets ≥ 44px | `Button.tsx`: `min-h-11` (44px). Todos los interactivos componen desde Button o tienen clase `min-h-11 min-w-11`. |
| localStorage puede fallar | try/catch en `setItem` + `getItem`. Si falla: carrito funciona en memoria, `storageAvailable = false`, toast/banner discreto. |
| `VITE_WHATSAPP_NUMBER` vacío | `buildWhatsAppMessage` lanza `Error` si undefined. `.env.example` incluido con instrucciones. Botón disabled si `import.meta.env.VITE_WHATSAPP_NUMBER` no está definido. |
| Docker multi-stage | Stage 1: `node:20-alpine` + `pnpm build`. Stage 2: `nginx:stable-alpine` sirve `dist/`. Ver ADR F001-003. |
| Tokens EzyHome | Reemplazar `tailwind.config.ts` completo. Actualizar `Button.tsx` y `SiteHeader.tsx`. Sin hex hardcodeado en componentes. Ver ADR F001-002. |
| Sin hex en componentes | Regla: solo clases Tailwind con tokens definidos en `tailwind.config.ts`. ESLint puede verificar con `eslint-plugin-tailwindcss`. |

---

## 6. Security Considerations

| Riesgo | Mitigación |
|---|---|
| XSS en blog (Markdown renderizado) | `react-markdown` no ejecuta HTML inline por defecto (`rehypeRaw` NO incluido). El Markdown lo escribe únicamente el dueño — sin input de usuarios externos en el blog. |
| Inyección en mensaje WhatsApp | `encodeURIComponent()` aplicado sobre el mensaje completo antes de construir la URL. |
| `VITE_WHATSAPP_NUMBER` en bundle | Por diseño: es el número público de negocio. Sin secretos reales en vars `VITE_*`. |
| Carrito en localStorage | Sin PII ni tokens de sesión. Solo `Product + quantity`. Riesgo bajo — aceptado. |
| Imágenes externas en blog | Restricción documentada: `image` en `index.json` apunta solo a `/public/`. Sin URLs externas. |
| Dependencias npm | `pnpm audit` en CI (`security.yml` ya configurado). |

---

## 7. Trade-offs y decisiones rechazadas

| Decisión | Elegida | Alternativa rechazada | Razón |
|---|---|---|---|
| Cart state | React Context + useReducer | Zustand | Sin dependencia extra; suficiente para v1 con un único dominio de estado global. Zustand agrega overhead de setup sin beneficio real a esta escala. |
| Blog rendering | react-markdown + remark-gfm | MDX / CMS headless | MDX overkill para blog estático de un solo autor. CMS introduce backend en v1 cuando el dueño edita archivos directamente. |
| Blog data loading | `import.meta.glob` + `?raw` | Fetch HTTP desde `/public/` | `import.meta.glob` es type-safe, tree-shakeable, Vite lo bundlea — sin request de red en runtime para archivos conocidos en build time. |
| Tipografía | Fontsource (npm) | Google Fonts CDN | Fontsource se bundlea con Vite → sin request DNS externo en carga → mejor LCP. Sin dependencia de disponibilidad de Google. |
| Checkout | WhatsApp wa.me URL | MercadoPago API v1 | v1 no requiere pasarela. Conversión documentada 5-15% vs 1-4% e-commerce con pago directo. Integración futura anotada en spec. |
| Tailwind tokens | Remapeo completo a nombres EzyHome | Mantener namespace scaffold (brand/surface/text) | Nomenclatura coherente con identidad de marca. Componentes existentes son shells sin implementación real — costo de renombrar es mínimo ahora, creciente después. |

---

## ADRs relacionados

- `docs/adrs/F001-001-cart-state-react-context.md` — React Context + useReducer para carrito
- `docs/adrs/F001-002-tailwind-token-remapping.md` — Reemplazo de tokens Tailwind a paleta EzyHome
- `docs/adrs/F001-003-blog-static-markdown.md` — Blog estático Markdown con import.meta.glob
