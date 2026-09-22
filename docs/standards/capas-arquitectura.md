# Capas de Arquitectura — EzyHome Frontend

**Decisión registrada en:** [`docs/adrs/ADR-004-arquitectura-frontend-capas.md`](../adrs/ADR-004-arquitectura-frontend-capas.md)

---

## Las 6 capas y qué vive en cada una

### `pages/`

Ensamblan features. **Sin lógica propia.** Un page importa componentes de features y los compone en layout.

```
src/pages/
  HomePage.tsx          ← monta HeroSection + ProductGrid del catalog feature
  ProductDetailPage.tsx ← monta galería + cart actions
  ComoComprarPage.tsx
  NotFoundPage.tsx
```

### `features/<nombre>/`

Todo lo relacionado a un dominio de negocio. Componentes, hooks, contexto, utils — todos juntos.

```
src/features/
  catalog/    CatalogPage, ProductCard, ProductGrid, CategoryFilter, useCatalog
  cart/       CartProvider, CartDrawer, CartItem, useCart, cartUtils
  blog/       BlogListPage, BlogCard, BlogPostPage, useBlogPost
  toast/      ToastProvider, ToastContext, useToast
```

Cada feature expone su API por `index.ts`. El hook consumidor del contexto vive
dentro de la feature (`useCart`, `useToast`), nunca en `hooks/`.

Ver estructura interna en [`docs/standards/modulos-feature.md`](./modulos-feature.md).

### `components/ui/`

Primitivos visuales **ciegos al dominio**. No saben que existe `Product`, `Cart`, ni `Blog`.

```
src/components/ui/
  Badge.tsx           ← recibe variant + children, nada más
  Button.tsx
  Drawer.tsx
  HeroCarousel.tsx    ← recibe los slides ya armados, no conoce productos
  QuantitySelector.tsx
  Toast.tsx
```

Ver cuándo usar `ui/` vs `features/` en [`docs/standards/componentes-ui-vs-feature.md`](./componentes-ui-vs-feature.md).

### `types/`

Contratos de datos compartidos entre features. Solo interfaces, tipos y funciones puras de transformación.

```
src/types/index.ts    → Product, CartItem, CartState, BlogMeta, Toast, ToastType,
                         getEffectivePrice
```

Regla: si un tipo es usado por una sola feature, vive dentro de esa feature. Sube a `types/` solo cuando lo usan 2+ features.

### `lib/`

Utilidades puras sin React. No importan de ninguna capa de la app.

```
src/lib/cn.ts         → utilidad de Tailwind para clases condicionales
src/lib/env.ts        → lectura de variables de entorno (`import.meta.env`)
src/lib/formatPrice.ts→ formateo de moneda ARS
```

`process.env` no existe en el bundle del browser: toda variable de entorno se
lee por `lib/env.ts`.

### `data/`

Datos estáticos. Sin lógica.

```
src/data/
  products.json       → catálogo de productos
  catalog.ts          → acceso tipado al catálogo (único cast a `Product[]`)
  blog/               → posts en Markdown + index.json
```

Ninguna capa importa `products.json` directo: el cast y el filtro por `active`
viven una sola vez en `catalog.ts`, que además es neutral entre features
(`catalog` y `cart` lo usan sin importarse entre sí).

---

## Regla de imports — unidireccional, sin excepciones

```
pages  →  features  →  components/ui  →  lib
              ↓              ↓
            types           types
              ↓
            data
```

| Capa             | Puede importar de                            | Nunca importa de                 |
| ---------------- | -------------------------------------------- | -------------------------------- |
| `pages/`         | `features/`, `components/ui`, `types`, `lib` | —                                |
| `features/`      | `components/ui`, `types`, `lib`, `data`      | Otras `features/` directamente\* |
| `components/ui/` | `lib`, `types`                               | `features/`                      |
| `lib/`           | — (nada de la app)                           | Todo                             |

\* Una feature puede importar de otra **solo a través de su `index.ts`**, nunca de rutas internas.

### Enforcement

Estas reglas no son honor system: `eslint.config.js` las aplica con
`@typescript-eslint/no-restricted-imports` por capa. Un import que cruce una
frontera falla `pnpm lint` con el mensaje de la capa correspondiente.

---

## Capas de soporte (no en `src/`)

```
public/products/{id}/   → imágenes locales y PDFs por producto
tests/                  → espeja la estructura de src/
```

Ver gestión de assets en [`docs/standards/assets-estaticos.md`](./assets-estaticos.md).
