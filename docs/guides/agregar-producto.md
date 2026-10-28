# Guía: Agregar un Producto al Catálogo

**Ver también:** [`docs/standards/assets-estaticos.md`](../standards/assets-estaticos.md) · [`docs/guides/agregar-pdf-manual.md`](./agregar-pdf-manual.md)

---

## Paso a paso

### 1. Obtener el ID y el SKU del producto

El `id` es el identificador de MercadoLibre (ej. `MLA2616773126`). Se encuentra en la URL del producto en ML. Este ID se usa en la URL de la web y como nombre de carpeta para los assets locales.

El `sku` es el **SKU del producto en el ERP**, copiado tal cual (se ve en Productos del ERP). Es lo que une la web con el ERP: el precio y el stock se le piden al ERP por SKU (ver [`actualizar-precios.md`](./actualizar-precios.md)). El producto tiene que existir en el ERP con precio; si no, la web lo muestra como "Consultar precio". Si después cambiás el SKU en el ERP, cambialo también acá.

### 2. Agregar la entrada en `src/data/products.json`

Copiar esta plantilla y completar todos los campos:

```json
{
  "id": "MLA_________",
  "sku": "SKU-DEL-ERP",
  "name": "Nombre completo del producto",
  "description": "Descripción detallada.\n\n- Característica 1\n- Característica 2\n\nFicha técnica: ...\n\nMensaje de cierre con EzyHome.",
  "category": "Iluminación Inteligente",
  "price": 00000,
  "images": ["https://http2.mlstatic.com/..."],
  "isBestseller": false,
  "active": true
}
```

No hay otros campos ni ofertas: la validación rechaza cualquier campo desconocido, para
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

### 4. Precio

El precio que ve el cliente **viene del ERP**, no de este archivo. `price` es
obligatorio (entero en pesos, sin centavos) pero no se mantiene: solo va al
JSON-LD (SEO) cuando el ERP no da precio. Poné el precio del local del momento.

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
producto MLA3316416628 › sku: SKU "SNS-001" duplicado, ya lo usa el producto #3
```

Valida forma (tipos, campos obligatorios —incluido `sku`—, campos desconocidos), reglas de
negocio (precios enteros y positivos, categoría obligatoria si el producto está activo) y
reglas del catálogo completo (ids y SKU únicos, categorías sin variantes disfrazadas).

`pnpm typecheck` **no** cubre esto: `products.json` entra a la app con un cast
(`as Product[]`) que no verifica nada en runtime.

### 10. Quality gate

```bash
pnpm lint && pnpm typecheck && pnpm format:check && pnpm test
```
