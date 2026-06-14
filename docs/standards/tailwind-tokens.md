# Tokens de Diseño EzyHome — Guía de uso

**Ver también:** [`docs/adrs/F001-002-tailwind-token-remapping.md`](../adrs/F001-002-tailwind-token-remapping.md)

Todos los tokens están definidos en `tailwind.config.ts`. **No usar hex literales en `className`.**
Si un color no existe como token, agregarlo al config — no hardcodearlo.

---

## Colores semánticos

### Superficies y texto

| Token              | Clase Tailwind                    | Hex       | Cuándo usarlo                                             |
| ------------------ | --------------------------------- | --------- | --------------------------------------------------------- |
| `background`       | `bg-background`                   | `#f4f7f9` | Fondo de página. El `<body>` y las secciones principales. |
| `foreground`       | `text-foreground`                 | `#1e2433` | Texto principal. Todo texto que no sea secundario.        |
| `card`             | `bg-card`                         | `#ffffff` | Fondo de tarjetas, modales, drawers, tooltips.            |
| `muted`            | `bg-muted`                        | `#eef1f4` | Fondos secundarios: placeholders, skeletons, chips.       |
| `muted-foreground` | `text-muted-foreground`           | `#6b7280` | Texto secundario: subtítulos, fechas, labels de ayuda.    |
| `border`           | `border-border` / `divide-border` | `#e2e8ef` | Todos los bordes y separadores.                           |

### Marca y acciones

| Token                | Clase Tailwind            | Hex       | Cuándo usarlo                                        |
| -------------------- | ------------------------- | --------- | ---------------------------------------------------- |
| `primary`            | `bg-primary`              | `#4a9e96` | CTAs principales, botones de acción, badges activos. |
| `primary-foreground` | `text-primary-foreground` | `#ffffff` | Texto sobre fondo `primary`.                         |

### Estados

| Token                | Clase Tailwind                        | Hex       | Cuándo usarlo                                    |
| -------------------- | ------------------------------------- | --------- | ------------------------------------------------ |
| `success`            | `bg-success` / `text-success`         | `#4caf86` | Confirmaciones, checkmarks, badge "Más vendido". |
| `warning`            | `bg-warning`                          | `#d4a017` | Alertas no críticas, badge "Oferta".             |
| `warning-foreground` | `text-warning-foreground`             | `#7a5a00` | Texto sobre fondo `warning`.                     |
| `destructive`        | `bg-destructive` / `text-destructive` | `#e53935` | Errores, acciones irreversibles (eliminar).      |

### Sidebar / navegación

| Token                | Clase Tailwind            | Hex       | Cuándo usarlo                                    |
| -------------------- | ------------------------- | --------- | ------------------------------------------------ |
| `sidebar`            | `bg-sidebar`              | `#242c3d` | Fondo del `<SiteHeader>` y drawer de navegación. |
| `sidebar-foreground` | `text-sidebar-foreground` | `#e8ecf0` | Texto dentro del header/sidebar.                 |
| `sidebar-accent`     | `bg-sidebar-accent`       | `#2e3a50` | Hover y estados activos dentro del sidebar.      |
| `sidebar-border`     | `border-sidebar-border`   | `#333d54` | Bordes internos del sidebar.                     |

---

## Tipografía

```
font-sans   → Inter, system-ui, sans-serif   (todo el UI)
font-mono   → Geist Mono, Menlo              (código, precios, IDs técnicos)
```

**Escalas de texto recomendadas** (clases Tailwind por defecto, no tokens propios):

| Uso                    | Clase                                |
| ---------------------- | ------------------------------------ |
| Título de página (H1)  | `text-2xl sm:text-3xl font-semibold` |
| Título de sección (H2) | `text-xl font-semibold`              |
| Título de tarjeta (H3) | `text-sm font-medium`                |
| Cuerpo                 | `text-sm` o `text-base`              |
| Texto secundario       | `text-xs text-muted-foreground`      |

---

## Anchos de contenido

| Token         | Clase           | Valor  | Cuándo usarlo                                         |
| ------------- | --------------- | ------ | ----------------------------------------------------- |
| `max-content` | `max-w-content` | 1200px | **Único ancho permitido** para contenedores de página |
| `max-prose`   | `max-w-prose`   | 65ch   | Solo para cuerpo de artículos de blog                 |

```tsx
// ✅ CORRECTO
<section className="mx-auto w-full max-w-content px-4 py-8 sm:px-6 lg:px-8">

// ❌ MAL — ancho arbitrario
<div className="mx-auto max-w-5xl ...">
```

---

## Animaciones

| Token         | Clase                 | Cuándo usarlo                            |
| ------------- | --------------------- | ---------------------------------------- |
| `slide-in-up` | `animate-slide-in-up` | Aparición de toasts, tooltips, dropdowns |
| `fade-slide`  | `animate-fade-slide`  | Transiciones de página o secciones       |

---

## Espaciado especial

| Token         | Clase            | Valor                         | Cuándo usarlo                         |
| ------------- | ---------------- | ----------------------------- | ------------------------------------- |
| `safe-bottom` | `pb-safe-bottom` | `env(safe-area-inset-bottom)` | Elementos fijos en el bottom (mobile) |

---

## Reglas de uso

1. **Solo tokens del config.** Sin hex literales (`text-[#4a9e96]` está prohibido).
2. **Sin `style={}`** para colores o tipografía expresables con Tailwind.
3. **Mobile-first:** `base → sm: → md: → lg:`. Nunca al revés.
4. **Clases condicionales con `cn()`** de `@/lib/cn`, no concatenación de strings.
5. **Tap targets mínimos:** `min-h-11` (44px) en todo elemento interactivo.
6. **Focus visible:** `focus-visible:ring-2 focus-visible:ring-primary` en todo elemento interactivo.

---

## Patrones frecuentes

### Tarjeta estándar

```tsx
<div className="rounded-lg border border-border bg-card text-foreground shadow-sm">
```

### Botón primario

```tsx
<button className="bg-primary text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary min-h-11 rounded px-4">
```

### Texto secundario

```tsx
<span className="text-xs text-muted-foreground">
```

### Sección full-bleed con fondo

```tsx
<section className="-mx-4 bg-sidebar px-4 py-16 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
```
