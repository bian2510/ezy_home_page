# Guía: Agregar un Producto al Catálogo

**Ver también:** [`docs/standards/assets-estaticos.md`](../standards/assets-estaticos.md) · [`docs/guides/agregar-pdf-manual.md`](./agregar-pdf-manual.md)

---

## Paso a paso

### 1. Obtener el ID del producto

El `id` es el identificador de MercadoLibre (ej. `MLA2616773126`). Se encuentra en la URL del producto en ML. Este ID se usa como nombre de carpeta para los assets locales.

### 2. Agregar la entrada en `src/data/products.json`

Copiar esta plantilla y completar todos los campos:

```json
{
  "id": "MLA_________",
  "name": "Nombre completo del producto",
  "description": "Descripción detallada.\n\n- Característica 1\n- Característica 2\n\nFicha técnica: ...\n\nMensaje de cierre con EzyHome.",
  "category": "Iluminación Inteligente",
  "price": 00000,
  "images": ["https://http2.mlstatic.com/..."],
  "isBestseller": false,
  "isOnSale": false,
  "active": true
}
```

**Campos opcionales** (agregar solo si aplican):

```json
"promotionalPrice": 00000,
"promotionBadge": "2x1",
"manualUrl": "/products/MLA________/manual.pdf"
```

### 3. Categorías válidas

Las categorías existentes en el catálogo son:

- `"Iluminación Inteligente"`
- `"Seguridad"`
- `"Confort"`
- `"Protección y Alertas"`
- `"Hubs"`

Si el producto no encaja en ninguna, consultá antes de crear una categoría nueva (afecta el `CategoryFilter`).

### 4. Reglas de precio

| Campo              | Cuándo usarlo                                                    |
| ------------------ | ---------------------------------------------------------------- |
| `price`            | Siempre. Precio de lista en ARS (entero, sin centavos).          |
| `isOnSale`         | `true` cuando hay precio especial.                               |
| `promotionalPrice` | Solo cuando `isOnSale: true`. Precio efectivo que ve el cliente. |
| `promotionBadge`   | Solo para promociones especiales como `"2x1"`.                   |

Cuando `isOnSale: true` y `promotionalPrice` está definido, `price` se muestra tachado.

### 5. Agregar imágenes locales (opcional, recomendado para productos propios)

Si tenés las imágenes del producto:

```bash
mkdir -p public/products/MLA_________/images
# Convertir a webp y nombrar 01.webp, 02.webp, etc.
```

Actualizar el campo `images` en el JSON:

```json
"images": [
  "/products/MLA_________/images/01.webp",
  "/products/MLA_________/images/02.webp"
]
```

### 6. Agregar el PDF de instrucciones (si existe)

Ver [`docs/guides/agregar-pdf-manual.md`](./agregar-pdf-manual.md).

### 7. Para ocultar un producto sin borrarlo

```json
"active": false
```

El producto no aparece en Home, Catálogo ni Detalle, pero persiste en el JSON para reactivarlo cuando vuelva el stock.

### 8. Quality gate

```bash
pnpm lint && pnpm typecheck && pnpm format:check
```

TypeScript valida que el JSON respeta la interfaz `Product` definida en `src/types/index.ts`. Si falta un campo requerido o el tipo no coincide, `typecheck` falla.
