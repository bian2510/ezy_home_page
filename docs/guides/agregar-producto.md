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
"promotionBadge": "2x1"
```

No hay otros campos: la validación rechaza cualquier campo desconocido, para
que un typo como `pirce` no deje el precio real en `undefined`.

### 3. Categorías válidas

Las categorías existentes en el catálogo son:

- `"Iluminación Inteligente"`
- `"Seguridad"`
- `"Confort"`
- `"Protección y Alertas"`
- `"Hubs"`

Si el producto no encaja en ninguna, consultá antes de crear una categoría nueva: el
`CategoryFilter` deriva los chips de este campo, así que cada valor nuevo es un chip nuevo.

Escribirla exactamente igual que las existentes. La validación rechaza variantes que difieren
solo en mayúsculas o espacios (`"seguridad "` vs `"Seguridad"`), porque generarían dos chips
para la misma categoría.

### 4. Reglas de precio

| Campo              | Cuándo usarlo                                                    |
| ------------------ | ---------------------------------------------------------------- |
| `price`            | Siempre. Precio de lista en ARS (entero, sin centavos).          |
| `isOnSale`         | `true` cuando hay precio especial.                               |
| `promotionalPrice` | Solo cuando `isOnSale: true`. Precio efectivo que ve el cliente. |
| `promotionBadge`   | Solo para promociones especiales como `"2x1"`.                   |

Cuando `isOnSale: true` y `promotionalPrice` está definido, `price` se muestra tachado.

**La validación exige que la oferta esté completa:** `isOnSale: true` sin `promotionalPrice`
se rechaza (la card anunciaría un descuento y cobraría el precio de lista), igual que un
`promotionalPrice` mayor o igual al `price`, o presente con `isOnSale: false`.

**Sin centavos:** `price` y `promotionalPrice` son enteros. Con decimales, la card redondea
para mostrar pero el carrito suma el valor exacto, y al cliente le cierra mal la cuenta.

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

### 8. Actualización masiva desde el export de Mercado Libre

Para actualizar precios y stock de todo el catálogo de una vez —la rutina
mensual—, no se edita el JSON producto por producto: se parte del export de
Mercado Libre.

```bash
pnpm precios:informe  "ruta/al/Precios.csv"   # muestra qué cambiaría, no escribe
pnpm precios:aplicar  "ruta/al/Precios.csv"   # aplica
```

El procedimiento completo —qué columnas espera el CSV, la regla de precios, qué
campos no toca y cómo se manejan los productos nuevos— está en
[`actualizar-precios.md`](./actualizar-precios.md).

### 9. Validar el catálogo

```bash
pnpm validate:products
```

Corre el esquema de [`src/data/productSchema.ts`](../../src/data/productSchema.ts) contra el
archivo real y falla nombrando el producto y el campo:

```
producto MLA2200632476 › price: price debe ser un entero en pesos, sin centavos
producto MLA3316416628 › isOnSale: tiene promotionalPrice pero isOnSale es false
```

Valida forma (tipos, campos obligatorios, campos desconocidos), reglas de negocio (precios
enteros y positivos, ofertas coherentes, categoría obligatoria si el producto está activo) y
reglas del catálogo completo (ids únicos, categorías sin variantes disfrazadas).

`pnpm typecheck` **no** cubre esto: `products.json` entra a la app con un cast
(`as Product[]`) que no verifica nada en runtime.

### 10. Quality gate

```bash
pnpm lint && pnpm typecheck && pnpm format:check && pnpm test
```
