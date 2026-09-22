# Guía: Agregar el PDF de Instrucciones a un Producto

**Ver también:** [`docs/standards/assets-estaticos.md`](../standards/assets-estaticos.md) · [`docs/guides/agregar-producto.md`](./agregar-producto.md)

> **Estado: no implementado.** `manualUrl` no existe hoy en la interfaz `Product`
> ni en `ProductDetailPage`, y la validación de `products.json` rechaza los campos
> desconocidos: agregarlo al JSON hace fallar `pnpm validate:products`. Esta guía
> describe cómo construir la feature, no un procedimiento vigente. Para
> habilitarla hay que sumar `manualUrl` al tipo, al esquema y al detalle de
> producto, en ese orden.

---

## Prerequisito

El producto ya debe existir en `src/data/products.json`. Si no, primero seguir [`docs/guides/agregar-producto.md`](./agregar-producto.md).

---

## Paso a paso

### 1. Ubicar el PDF en `public/`

```bash
mkdir -p public/products/{ID_DEL_PRODUCTO}
# Copiar el PDF y renombrarlo
cp instrucciones-originales.pdf public/products/MLA2616773126/manual.pdf
```

El nombre siempre es `manual.pdf`. Un producto tiene a lo sumo un PDF de instrucciones.

### 2. Agregar `manualUrl` al producto en `products.json`

```json
{
  "id": "MLA2616773126",
  "name": "Bombilla LED Inteligente WiFi RGB + Blanca E27",
  ...
  "manualUrl": "/products/MLA2616773126/manual.pdf"
}
```

### 3. Verificar que el tipo `Product` tiene el campo

En `src/types/index.ts`, el campo debe existir:

```ts
interface Product {
  // ...
  manualUrl?: string;
}
```

Si no está, agregarlo antes de continuar.

### 4. Mostrar el botón en `ProductDetailPage`

En `src/pages/ProductDetailPage.tsx`, dentro del bloque de info del producto, agregar:

```tsx
{
  product.manualUrl && (
    <a
      href={product.manualUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      Descargar instrucciones (PDF)
    </a>
  );
}
```

### 5. Quality gate

```bash
pnpm lint && pnpm typecheck && pnpm format:check
```

---

## Verificación manual

1. `pnpm dev`
2. Navegar a `/productos/{ID}`
3. Confirmar que el link "Descargar instrucciones (PDF)" aparece
4. Confirmar que el click abre el PDF en una nueva pestaña

---

## Si el PDF no carga (404)

Verificar que:

- El archivo está en `public/products/{id}/manual.pdf` (path exacto, case-sensitive)
- El `id` en la carpeta coincide exactamente con el `id` del producto en `products.json`
- El servidor de desarrollo está corriendo desde la raíz del proyecto (`pnpm dev` desde `/ezy_home_page/`)
