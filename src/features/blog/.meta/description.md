# src/features/blog/

**Purpose:** El blog informativo: el listado (`/blog`) y cada artículo
(`/blog/:slug`). Solo el dueño publica; el contenido son archivos estáticos
(ADR F001-003). Cómo publicar uno: `docs/guides/agregar-articulo-blog.md`.

## Key Components

- `BlogListPage.tsx` — `PageHeader` y una `BlogCard` por artículo de `data/blog/index.json`, en el orden del índice
- `BlogCard.tsx` — tarjeta: portada, etiqueta (`category`), fecha, título, bajada y "Leer artículo"; toda la tarjeta es un `<Link>`
- `BlogPostPage.tsx` — artículo: ruta de navegación, "Volver al Blog", etiqueta, minutos de lectura, portada y el índice al costado; un slug desconocido muestra `NotFoundState`
- `BlogMarkdown.tsx` — el cuerpo en Markdown con los estilos del mock (secciones con barra, citas como recuadro, tablas)
- `BlogToc.tsx` — "En este artículo": un link a cada `##`
- `blogUtils.ts` — `extractHeadings`, `slugifyHeading`, `readingMinutes`, `formatBlogDate`, `blogImageSrcSet`
- `useBlogPost.ts` + `blogFiles.ts` — busca el artículo en el índice y carga su `.md` bajo demanda

## Patterns

- El `id` de cada `##` lo arma `slugifyHeading` en los dos lados (índice y título), así los links del índice coinciden
- La fecha `YYYY-MM-DD` se formatea con el constructor de hora local: con `new Date(string)` en UTC-3 se ve el día anterior

## Constraints

- Sin `rehype-raw`: el HTML crudo dentro de un `.md` no se interpreta
- El título va en `index.json`, no como `#` en el `.md`: se vería repetido
