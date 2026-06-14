# Assets Estáticos — Imágenes y PDFs de Productos

**Ver también:** [`docs/guides/agregar-producto.md`](../guides/agregar-producto.md) · [`docs/guides/agregar-pdf-manual.md`](../guides/agregar-pdf-manual.md)

---

## Dos tipos de assets de producto

### 1. Imágenes externas (estado actual)

Las imágenes actuales son URLs de MercadoLibre:

```json
"images": [
  "https://http2.mlstatic.com/D_841005-MLA99506324020_112025-O.webp"
]
```

**Cuándo usar URLs externas:** cuando la imagen viene de un proveedor externo y no tenemos control sobre el archivo.

**Riesgo:** las URLs de MercadoLibre pueden expirar o cambiar. Si un producto se migra a imágenes propias, usar el esquema local.

### 2. Assets locales (esquema para producción propia)

```
public/
  products/
    {id}/               ← id del producto (ej. MLA2616773126)
      images/
        01.webp         ← imagen principal
        02.webp
        03.webp
      manual.pdf        ← instrucciones del producto (si existen)
```

En `products.json`, las imágenes locales se referencian con paths relativos a `public/`:

```json
{
  "id": "MLA2616773126",
  "images": ["/products/MLA2616773126/images/01.webp", "/products/MLA2616773126/images/02.webp"],
  "manualUrl": "/products/MLA2616773126/manual.pdf"
}
```

---

## Campo `manualUrl` en el tipo `Product`

```ts
// src/types/index.ts
interface Product {
  // ... campos existentes
  manualUrl?: string; // ruta al PDF de instrucciones, si existe
}
```

El campo es opcional. Si está presente, `ProductDetailPage` muestra un botón "Descargar instrucciones". Ver guía completa en [`docs/guides/agregar-pdf-manual.md`](../guides/agregar-pdf-manual.md).

---

## Convenciones de naming

| Asset                | Convención                                       | Ejemplo              |
| -------------------- | ------------------------------------------------ | -------------------- |
| Carpeta del producto | ID del producto tal cual está en `products.json` | `MLA2616773126/`     |
| Imágenes             | número secuencial con ceros, formato webp        | `01.webp`, `02.webp` |
| PDF de instrucciones | siempre `manual.pdf`                             | `manual.pdf`         |

**Por qué webp:** mejor compresión que jpg/png, soportado por todos los browsers modernos. Convertir antes de subir.

---

## Assets del blog

Las imágenes de posts de blog viven en:

```
public/
  blog/
    {slug}/
      cover.webp      ← imagen de portada del post
```

Referenciados en `src/data/blog/index.json`:

```json
{ "slug": "introduccion-domotica", "image": "/blog/introduccion-domotica/cover.webp" }
```

---

## Assets del sitio (marca)

```
public/
  logo.svg
  og-image.png        ← imagen para Open Graph / redes sociales
  favicon.ico
```

Estos no siguen la estructura por producto — son del sitio en general.
