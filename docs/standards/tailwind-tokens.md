# Tokens de Diseño EzyHome — Guía de uso

**Ver también:** [`docs/adrs/F001-002-tailwind-token-remapping.md`](../adrs/F001-002-tailwind-token-remapping.md)

Todos los tokens están definidos en `tailwind.config.ts`. **No usar hex literales en `className`.**
Si un color no existe como token, agregarlo al config — no hardcodearlo.

---

## Colores semánticos

Paleta del rediseño "Smart Commerce Slate" (2026-11). Los nombres semánticos de
antes se mantienen con valores nuevos; se sumaron `primary-container`,
`primary-fixed`, `tertiary-*` e `inverse-*`.

### Superficies y texto

| Token              | Clase Tailwind                    | Hex       | Cuándo usarlo                                             |
| ------------------ | --------------------------------- | --------- | --------------------------------------------------------- |
| `background`       | `bg-background`                   | `#f7faf8` | Fondo de página. El `<body>` y las secciones principales. |
| `foreground`       | `text-foreground`                 | `#181c1c` | Texto principal. Todo texto que no sea secundario.        |
| `card`             | `bg-card`                         | `#ffffff` | Fondo de tarjetas, modales, drawers, tooltips.            |
| `muted`            | `bg-muted`                        | `#ebefed` | Fondos secundarios: placeholders, skeletons, chips.       |
| `muted-foreground` | `text-muted-foreground`           | `#466462` | Texto secundario: subtítulos, fechas, labels de ayuda.    |
| `border`           | `border-border` / `divide-border` | `#e0e3e2` | Todos los bordes y separadores.                           |

### Marca y acciones

| Token                | Clase Tailwind            | Hex       | Cuándo usarlo                                                  |
| -------------------- | ------------------------- | --------- | -------------------------------------------------------------- |
| `primary`            | `bg-primary`              | `#006a67` | CTAs principales, botones de acción, chip activo.              |
| `primary-foreground` | `text-primary-foreground` | `#ffffff` | Texto sobre fondo `primary` o `primary-container`.             |
| `primary-container`  | `bg-primary-container`    | `#2c8380` | Fondo del header y hover de botones primarios (blanco: 4.5:1). |
| `primary-fixed`      | `ring-primary-fixed`      | `#9ff1ed` | Anillo de foco sobre fondos `primary` / `primary-container`.   |

### Carteles de precio

| Token                      | Clase Tailwind                  | Hex       | Cuándo usarlo                                         |
| -------------------------- | ------------------------------- | --------- | ----------------------------------------------------- |
| `tertiary`                 | `bg-tertiary` / `text-tertiary` | `#8c4d2f` | Acento de ofertas.                                    |
| `tertiary-soft`            | `bg-tertiary-soft`              | `#ffdbcd` | Fondo del cartel de descuento real por transferencia. |
| `tertiary-soft-foreground` | `text-tertiary-soft-foreground` | `#70371b` | Texto sobre `tertiary-soft`.                          |

### Estados

| Token                | Clase Tailwind                        | Hex       | Cuándo usarlo                               |
| -------------------- | ------------------------------------- | --------- | ------------------------------------------- |
| `success`            | `bg-success` / `text-success`         | `#4caf86` | Confirmaciones, checkmarks.                 |
| `warning`            | `bg-warning`                          | `#d4a017` | Alertas no críticas.                        |
| `warning-foreground` | `text-warning-foreground`             | `#7a5a00` | Texto sobre fondo `warning`.                |
| `destructive`        | `bg-destructive` / `text-destructive` | `#ba1a1a` | Errores, acciones irreversibles (eliminar). |

### Superficie oscura (footer)

| Token                | Clase Tailwind            | Hex       | Cuándo usarlo                             |
| -------------------- | ------------------------- | --------- | ----------------------------------------- |
| `inverse`            | `bg-inverse`              | `#2d3131` | Fondo del `<SiteFooter>`.                 |
| `inverse-foreground` | `text-inverse-foreground` | `#eef1f0` | Títulos sobre `inverse`.                  |
| `inverse-muted`      | `text-inverse-muted`      | `#bec9c7` | Texto secundario y links sobre `inverse`. |
| `inverse-primary`    | `text-inverse-primary`    | `#83d4d1` | Íconos y hover sobre `inverse`.           |
| `inverse-border`     | `border-inverse-border`   | `#454b4b` | Separadores sobre `inverse`.              |

`sidebar-*` queda con los mismos valores que `inverse-*` para las secciones
oscuras que ya lo usan (Home). Para código nuevo, usar `inverse-*`.

---

## Tipografía

```
font-sans   → Plus Jakarta Sans (variable, @fontsource-variable), system-ui   (todo el UI)
font-mono   → Geist Mono, Menlo                                               (código, IDs técnicos)
```

Los precios van en `font-sans` con `tabular-nums`. Las fuentes nunca se
embeben en el CSS (`assetsInlineLimit` en `vite.config.ts`): cada subset se
baja solo si la página lo usa.

**Escalas de texto** (además de las de Tailwind):

| Uso                    | Clase                                                        |
| ---------------------- | ------------------------------------------------------------ |
| Título de página (H1)  | `text-headline-xl-mobile sm:text-headline-xl font-extrabold` |
| Precio en card         | `text-headline-md font-extrabold`                            |
| Título de tarjeta (H3) | `text-headline-sm font-bold`                                 |
| Cuerpo                 | `text-sm` o `text-base`                                      |
| Etiqueta / categoría   | `text-label-sm font-bold uppercase`                          |
| Texto secundario       | `text-xs text-muted-foreground`                              |

## Radios y sombras

| Token               | Valor     | Cuándo usarlo                 |
| ------------------- | --------- | ----------------------------- |
| `rounded`           | `0.5rem`  | Botones, inputs.              |
| `rounded-md`        | `0.75rem` | Contenedores chicos.          |
| `rounded-lg`        | `1rem`    | Cards de producto, paneles.   |
| `rounded-xl`        | `1.5rem`  | Bloques grandes.              |
| `rounded-full`      | pill      | Chips de categoría, carteles. |
| `shadow-card`       | nivel 1   | Cards en reposo.              |
| `shadow-card-hover` | nivel 2   | Card con hover.               |
| `shadow-header`     | nivel 3   | Header sticky.                |

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
<section className="-mx-4 bg-inverse px-4 py-16 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
```
