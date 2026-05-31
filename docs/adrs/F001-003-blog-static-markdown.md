# ADR F001-003: Blog estático con Markdown e import.meta.glob

**Feature:** F001 — EzyHome Storefront Page  
**Fecha:** 2026-05-24  
**Estado:** Aceptado

---

## Contexto

EzyHome necesita un blog informativo sobre domótica publicado por el dueño. El contenido es read-only para visitantes; el dueño edita archivos directamente. Se evaluaron: CMS headless (Contentful/Strapi), MDX, y Markdown estático con carga en Vite.

## Decisión

**Markdown estático** en `src/data/blog/*.md` con metadatos en `src/data/blog/index.json`. Carga via `import.meta.glob('../../data/blog/*.md', { query: '?raw', eager: false })`. Renderizado con `react-markdown` + `remark-gfm`.

## Justificación

**Por qué no CMS headless:**

- Introduce backend y API key en v1 donde no hay ninguno.
- El dueño edita archivos directamente — no necesita UI de edición.
- Costo mensual innecesario para v1.

**Por qué no MDX:**

- MDX permite componentes React en Markdown — el dueño no es desarrollador, no usa componentes.
- Setup más complejo (plugin de Vite, tipos) sin beneficio para este caso de uso.

**Por qué import.meta.glob sobre fetch a /public/:**

- `import.meta.glob` es type-safe y Vite lo bundlea — sin request HTTP extra en runtime.
- Los archivos conocidos en build time no necesitan fetching dinámico.
- Tree-shakeable: Vite incluye solo los .md que existen, sin overhead.

**Por qué react-markdown:**

- Biblioteca más usada para Markdown en React (>4M descargas/semana).
- No ejecuta HTML inline por defecto — seguro para contenido del dueño.
- `remark-gfm` agrega soporte para tablas, listas de tareas, links automáticos — útil para tutoriales de domótica.

## Consecuencias

- El dueño agrega posts creando un `.md` en `src/data/blog/` y añadiendo la entrada en `index.json`. Requiere rebuild y redeploy (aceptable para v1).
- Si en v2 se necesita publicación sin deploy, migrar a CMS headless (Contentful free tier o Directus self-hosted en la EC2 existente).
- `useBlogPost` resuelve el slug al archivo correspondiente; si el slug no existe, `notFound: true` → 404 page.
- Imágenes del blog deben estar en `public/` — sin URLs externas (restricción de seguridad documentada).

## Alternativas rechazadas

| Alternativa                      | Razón de rechazo                                                                         |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| CMS headless (Contentful/Strapi) | Backend innecesario en v1; costo; complejidad                                            |
| MDX                              | Soporte de componentes React no necesario para este caso de uso; setup más complejo      |
| Fetch desde /public/\*.md        | Request HTTP extra en runtime; sin type-safety; archivos conocidos en build time         |
| JSON con contenido inline        | Markdown en JSON es inmanejable para artículos largos; sin syntax highlighting en editor |
