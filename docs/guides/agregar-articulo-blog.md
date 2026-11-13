# Publicar un artículo en el blog

El blog no tiene panel: cada artículo es un archivo Markdown más una entrada en
el índice (ADR [`F001-003`](../adrs/F001-003-blog-static-markdown.md)). Publicar
es agregar esos archivos, pasar el quality gate y desplegar.

---

## 1. El texto: `src/data/blog/<slug>.md`

El `slug` es el final de la URL (`/blog/<slug>`): minúsculas, sin tildes, con
guiones. No se cambia después de publicar, porque rompe los links compartidos.

```markdown
Párrafo de introducción.

## 1. Primera sección

Texto con **negritas**.

### Un subtítulo

- Un punto
- Otro punto

> **Un recuadro destacado**
>
> Lo que va dentro de una cita se ve como recuadro con borde de color.

| Criterio | Opción A | Opción B |
| -------- | -------- | -------- |
| Precio   | Bajo     | Alto     |
```

- **Sin `#` de título:** el título sale de `index.json`. Si lo ponés, se ve dos veces.
- **Cada `##` es una sección** y aparece en el índice "En este artículo".
- **El HTML no se interpreta:** solo Markdown.
- **Español argentino, con voseo:** "descubrí", "podés".

## 2. La portada: `public/images/blog/`

Tres anchos en WebP, con el slug en el nombre:

```
public/images/blog/<slug>-640.webp
public/images/blog/<slug>-1024.webp
public/images/blog/<slug>-1376.webp
```

La más grande no debería pasar de ~80 kB. Ver
[`assets-estaticos.md`](../standards/assets-estaticos.md#assets-del-blog).

## 3. La entrada en `src/data/blog/index.json`

```json
{
  "slug": "mi-articulo",
  "title": "Título del artículo",
  "date": "2026-11-13",
  "image": "/images/blog/mi-articulo-1024.webp",
  "excerpt": "Una o dos oraciones: se ven en la tarjeta, debajo del título y en Google.",
  "category": "Iluminación"
}
```

| Campo      | Obligatorio | Para qué                                                               |
| ---------- | ----------- | ---------------------------------------------------------------------- |
| `slug`     | Sí          | URL del artículo; igual al nombre del `.md`.                           |
| `title`    | Sí          | Título del artículo y de la pestaña.                                   |
| `date`     | Sí          | `YYYY-MM-DD`.                                                          |
| `image`    | Sí          | La portada de 1024, o `null` si no tiene.                              |
| `excerpt`  | No          | Bajada de la tarjeta y del artículo, y la description para buscadores. |
| `category` | No          | Etiqueta sobre la portada.                                             |

El listado muestra los artículos en el orden del archivo.

## 4. Verificar y publicar

```bash
pnpm dev     # mirá /blog y /blog/<slug>
pnpm lint && pnpm typecheck && pnpm format:check && pnpm test
```

El sitemap suma el artículo solo en el próximo `pnpm build`. El deploy está en
[`deploy-y-ci.md`](./deploy-y-ci.md).
