# Tokens de Diseño EzyHome — Guía de uso

**Ver también:** [`docs/adrs/F001-002-tailwind-token-remapping.md`](../adrs/F001-002-tailwind-token-remapping.md)

Todos los tokens están definidos en `tailwind.config.ts`. **No usar hex literales en `className`.**
Si un color no existe como token, agregarlo al config — no hardcodearlo.

---

## Colores

Paleta del rediseño (2026-11), tomada del mock del catálogo (`code.html` y
`screen.png` del export de Stitch). Donde el `DESIGN.md` del export dice otra
cosa, manda el mock.

Hay dos juegos de nombres con los mismos valores:

- **Semánticos** (`primary`, `muted`, `card`…): los de siempre. El resto del
  sitio los sigue usando y toma la paleta sin cambios.
- **Del mock** (`surface-container`, `on-primary`, `inverse-surface`…): los
  usan las pantallas rediseñadas, para calcar las clases del diseño.

### Superficies y texto

| Semántico          | Del mock                                        | Hex                   | Cuándo usarlo                               |
| ------------------ | ----------------------------------------------- | --------------------- | ------------------------------------------- |
| `background`       | `surface`                                       | `#f8f9ff`             | Fondo de página.                            |
| `card`             | `surface-container-lowest`                      | `#ffffff`             | Cards, filtro, buscador, botón del carrito. |
| —                  | `surface-container-low`                         | `#eff4ff`             | Fondo de la imagen en la card.              |
| `muted`            | `surface-container`                             | `#e5eeff`             | Chips inactivos, placeholders.              |
| —                  | `surface-container-high`                        | `#dce9ff`             | Hover de chips.                             |
| `border`           | `surface-container-highest` / `surface-variant` | `#d3e4fe`             | Bordes; texto sobre el footer.              |
| `foreground`       | `on-surface`                                    | `#0b1c30`             | Texto principal.                            |
| `muted-foreground` | `secondary`                                     | `#545f73`             | Texto secundario, categoría de la card.     |
| —                  | `on-surface-variant`                            | `#3f4948`             | Placeholder del buscador.                   |
| —                  | `outline` / `outline-variant`                   | `#6f7978` / `#bec9c7` | Bordes sutiles (`border-outline/20`).       |

### Marca y acciones

| Semántico            | Del mock     | Hex       | Cuándo usarlo                                          |
| -------------------- | ------------ | --------- | ------------------------------------------------------ |
| `primary`            | —            | `#056765` | CTAs, chip activo, badge del carrito.                  |
| `primary-foreground` | `on-primary` | `#ffffff` | Texto sobre `primary`, `primary-container` y `header`. |
| `primary-container`  | —            | `#2f807e` | Hover de botones primarios.                            |
| `primary-fixed`      | —            | `#a3f0ed` | Hover de links y anillo de foco sobre el header.       |
| `header`             | —            | `#2c8380` | Fondo del header (blanco encima: 4.5:1, el mínimo AA). |

### Carteles de precio

| Token                | Hex       | Cuándo usarlo                                         |
| -------------------- | --------- | ----------------------------------------------------- |
| `tertiary`           | `#8d4b00` | Acento de ofertas.                                    |
| `tertiary-container` | `#b15f00` | Fondo del cartel "-N% transferencia" (blanco: 4.7:1). |
| `on-tertiary`        | `#ffffff` | Texto sobre `tertiary-container`.                     |

### Estados

| Token                | Clase Tailwind                        | Hex       | Cuándo usarlo                               |
| -------------------- | ------------------------------------- | --------- | ------------------------------------------- |
| `success`            | `bg-success` / `text-success`         | `#4caf86` | Confirmaciones, checkmarks.                 |
| `warning`            | `bg-warning`                          | `#d4a017` | Alertas no críticas.                        |
| `warning-foreground` | `text-warning-foreground`             | `#7a5a00` | Texto sobre fondo `warning`.                |
| `destructive`        | `bg-destructive` / `text-destructive` | `#ba1a1a` | Errores, acciones irreversibles (eliminar). |

### Superficie oscura (footer)

| Token                | Hex       | Cuándo usarlo                           |
| -------------------- | --------- | --------------------------------------- |
| `inverse-surface`    | `#213145` | Fondo del `<SiteFooter>`.               |
| `inverse-on-surface` | `#eaf1ff` | Títulos sobre `inverse-surface`.        |
| `surface-variant`    | `#d3e4fe` | Texto y links sobre `inverse-surface`.  |
| `inverse-primary`    | `#87d4d1` | Íconos y hover sobre `inverse-surface`. |

`sidebar-*` queda con el mismo azul oscuro para las secciones que ya lo usan
(Home). Para código nuevo, usar `inverse-surface`.

---

## Tipografía

```
font-sans   → Plus Jakarta Sans (variable, @fontsource-variable), system-ui   (todo el UI)
font-mono   → Geist Mono, Menlo                                               (código, IDs técnicos)
```

Los precios van en `font-sans` con `tabular-nums`. Las fuentes nunca se
embeben en el CSS (`assetsInlineLimit` en `vite.config.ts`): cada subset se
baja solo si la página lo usa.

**Escalas de texto del mock** (además de las de Tailwind): `headline-xl`,
`headline-xl-mobile`, `headline-md`, `headline-sm`, `body-lg`, `body-md`,
`body-sm`, `label-lg`, `label-md`, `label-sm`.

| Uso                    | Clase                                                        |
| ---------------------- | ------------------------------------------------------------ |
| Título de página (H1)  | `text-headline-xl-mobile sm:text-headline-xl font-extrabold` |
| Precio en card         | `text-headline-md font-extrabold`                            |
| Título de tarjeta (H3) | `text-headline-sm font-bold`                                 |
| Chip, link del header  | `text-label-md`                                              |
| Botón de acción        | `text-label-lg font-bold`                                    |
| Etiqueta / categoría   | `text-label-sm font-bold uppercase`                          |

## Radios y sombras

Radios del mock, más chicos que los de Tailwind por defecto:

| Clase          | Valor     | Cuándo usarlo                         |
| -------------- | --------- | ------------------------------------- |
| `rounded`      | `0.25rem` | Carteles ("-N% transferencia").       |
| `rounded-lg`   | `0.5rem`  | Botones, buscador, botón del carrito. |
| `rounded-xl`   | `0.75rem` | Cards de producto, barra de filtros.  |
| `rounded-full` | pill      | Chips de categoría.                   |

Sombras: las de Tailwind (`shadow-sm` en reposo, `shadow-xl` en hover de card)
y `shadow-header` para el header sticky.

---

## Anchos de contenido

| Token         | Clase           | Valor  | Cuándo usarlo                                         |
| ------------- | --------------- | ------ | ----------------------------------------------------- |
| `max-content` | `max-w-content` | 1280px | **Único ancho permitido** para contenedores de página |
| `max-prose`   | `max-w-prose`   | 65ch   | Solo para cuerpo de artículos de blog                 |
| `max-card`    | `max-w-card`    | 56rem  | Tarjeta centrada de la confirmación del pedido        |

Es el `max-w-7xl` de los mocks. El contenedor se arma con `components/ui/Container`, que suma los
márgenes laterales (ver "Espaciado especial"); no se repiten las clases a mano.

```tsx
// ✅ CORRECTO
<Container className="py-8">…</Container>

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

| Token           | Clase              | Valor                         | Cuándo usarlo                                          |
| --------------- | ------------------ | ----------------------------- | ------------------------------------------------------ |
| `safe-bottom`   | `pb-safe-bottom`   | `env(safe-area-inset-bottom)` | Elementos fijos en el bottom (mobile)                  |
| `gutter-mobile` | `px-gutter-mobile` | `1rem`                        | Margen lateral del contenedor en el celular (16 px)    |
| `gutter`        | `sm:px-gutter`     | `1.5rem`                      | Margen lateral desde `sm` (el `px-gutter` del mock)    |
| `margin`        | `md:px-margin`     | `3rem`                        | Margen lateral desde `md` (el `md:px-margin` del mock) |

Otros tokens de layout: `min-h-hero` (41.25rem, alto del hero del Home en escritorio) y
`object-hero` (`75% center`, encuadre de la foto del hero en el celular).

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
