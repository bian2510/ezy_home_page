# ¿Dónde vive este componente: `ui/` o `features/`?

**Ver también:** [`docs/standards/capas-arquitectura.md`](./capas-arquitectura.md)

---

## La pregunta clave

> **¿Este componente necesita saber que existe `Product`, `Cart`, `Blog` u otra entidad de negocio?**

- **No** → `src/components/ui/`
- **Sí** → `src/features/<dominio>/components/`

---

## Árbol de decisión

```
¿Importa o recibe tipos de dominio (Product, CartItem, BlogMeta)?
│
├── Sí → features/<dominio>/components/
│
└── No ¿Usa algún Context de negocio (useCart, useCatalog)?
    │
    ├── Sí → features/<dominio>/components/
    │
    └── No ¿Podría existir en cualquier otro proyecto React?
        │
        ├── Sí → components/ui/
        │
        └── No → probablemente features/, revisá si tiene lógica de dominio implícita
```

---

## Ejemplos reales del repo

### `components/ui/` — ciegos al dominio

| Componente             | Por qué va en `ui/`                                          |
| ---------------------- | ------------------------------------------------------------ |
| `Badge.tsx`            | Recibe `variant` y `children`. No sabe qué es un producto.   |
| `Button.tsx`           | Primitivo genérico. Podría estar en cualquier app.           |
| `QuantitySelector.tsx` | Recibe `value`, `onChange`, `min`. Sin semántica de carrito. |
| `Drawer.tsx`           | Overlay genérico. No sabe qué pone adentro.                  |

### `features/*/` — conocen el dominio

| Componente           | Por qué va en `features/`                                            |
| -------------------- | -------------------------------------------------------------------- |
| `ProductCard.tsx`    | Recibe `Product`, llama `useCart()`, navega a `/productos/:id`.      |
| `CartItem.tsx`       | Recibe `CartItem`, tiene botones de cantidad y eliminar del carrito. |
| `BlogCard.tsx`       | Recibe `BlogMeta`, linkea a `/blog/:slug`.                           |
| `CategoryFilter.tsx` | Filtra productos por categoría — lógica de catálogo.                 |

---

## Componentes de layout

`SiteHeader.tsx` y `SiteFooter.tsx` van en `src/components/layout/`. Son chrome de página — conocen la estructura de navegación pero no el estado de negocio. Excepción: `SiteHeader` puede importar `useCart` para el badge de cantidad.

---

## Regla de extracción

Si un componente de `features/` crece en partes reutilizables sin lógica de dominio (ej. un `PriceDisplay` que solo formatea un número), extraer esa parte a `ui/` y componer desde la feature.

Ver convenciones completas de componentes en [`docs/frontend-conventions.md`](../frontend-conventions.md) §2.
