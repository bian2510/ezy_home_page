# Architect Codebase Research — F001 EzyHome Storefront

## Archivos existentes relevantes

### App.tsx
- Patrón RootLayout + Routes ya establecido
- Rutas existentes: `/` (HomePage), `*` (NotFoundPage)
- Nuevas rutas a agregar: `/catalogo`, `/productos/:id`, `/carrito`, `/blog`, `/blog/:slug`

### Button.tsx (`src/components/ui/Button.tsx`)
- Usa tokens placeholder: `bg-brand-600`, `text-brand-700`, `bg-surface`, `text-text`
- Requiere actualización a tokens EzyHome tras el remapeo de tailwind.config.ts
- `min-h-11` (44px) ya cumple el requisito de tap target

### SiteHeader.tsx
- Usa tokens placeholder: `border-slate-200`, `bg-surface`, `text-brand-700`, `text-text-muted`
- Nav actual: solo link a `/` (Inicio) — requiere nav real + badge de carrito
- Requiere actualización a tokens EzyHome

### tailwind.config.ts
- Tokens actuales: `brand`, `surface`, `text` — todos placeholders con valores incorrectos
- Reemplazo completo requerido (ADR F001-002)
- Tipografía: solo Inter en sans/display — agregar Geist Mono en mono

### src/types/index.ts
- Solo tiene `Locale` type
- Agregar: Product, CartItem, CartState, BlogMeta

### src/features/catalog/ y src/features/cart/
- Ambos directorios vacíos — listos para implementación
- Sin archivos conflictivos

### src/pages/
- `HomePage.tsx` y `NotFoundPage.tsx` existen (shells)
- Agregar: ProductDetailPage, CartPage → o mover CartPage a features/cart/

### src/layouts/RootLayout.tsx
- Existe — envolver con CartProvider en esta fase

### src/lib/cn.ts
- Existe — clsx/twMerge utility, conservar sin cambios

## Patrones establecidos
- Feature-based directory structure: `src/features/<feature>/`
- RootLayout como wrapper de todas las rutas
- Componentes UI en `src/components/ui/`
- Layout en `src/components/layout/`
- Tipos compartidos en `src/types/index.ts`
- Pages en `src/pages/`

## ADRs previos
- Ninguno (greenfield)

## INVARIANTS.md
- No existe en el repo

## Antipatterns
- No existe `.etc_sdlc/antipatterns.md`
