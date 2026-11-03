# src/features/home/

**Purpose:** Secciones de la portada (`/`). `pages/HomePage.tsx` solo las
arma y pone los metadatos.

## Key Components

- `HomeHero.tsx` — H1, acciones (catálogo y WhatsApp) y los dos datos destacados
- `FeaturedProducts.tsx` — "Nuestros productos": selección curada con los chips y la card del catálogo
- `CategoryCards.tsx` — una tarjeta por categoría real con su cantidad de productos
- `BenefitCards.tsx`, `HowItWorks.tsx`, `RoutineBanner.tsx` — contenido fijo
- `homeUtils.ts` — `selectFeaturedProducts`, `buildCategoryCards`, `productCountLabel`

## Dependencies

- `@/data/catalog`, `@/data/categoryDescriptions` — productos y bajada de cada categoría
- `@/features/catalog` — `ProductCard`, `CategoryFilter`, `countByCategory`
- `@/components/ui` — `Icon`

## Patterns

- Sin datos de ventas: la selección son los productos con `isBestseller` y no se rotula "más vendido"
- Todo texto sobre los productos tiene que ser verdadero (confirmado por el dueño o sacado de `products.json`)

## Constraints

- Va en el bundle inicial (la landing no es lazy): nada de imágenes ni librerías nuevas en la primera pantalla
- No llama al backend: precio y stock llegan por la card del catálogo (`pricing`)
