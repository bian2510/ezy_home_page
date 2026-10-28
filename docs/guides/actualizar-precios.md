# Precios y stock: vienen del ERP

**Desde 2026-10-28 el precio y el stock que ve el cliente salen del ERP de
EzyHome**, no de este repo (ADR-025 del ERP, camino 1). Ya no hay rutina mensual
de precios ni ofertas.

---

## Cómo funciona

- Cada producto de `src/data/products.json` tiene un **`sku`**, que tiene que ser
  **igual al SKU del producto en el ERP** (mayúsculas y espacios alrededor no
  importan).
- Al cargar el sitio, `PricingProvider` (`src/features/pricing/`) pide una sola
  vez al ERP el precio y el stock de todos los SKU activos:
  `GET https://ezyhome.app/api/store/products?skus=...` con la clave
  `VITE_STORE_API_KEY` (secret del repo, ver [`deploy-y-ci.md`](./deploy-y-ci.md)).
- El ERP devuelve dos precios: **con Mercado Pago** (precio del local + recargo,
  redondeado a $100) y **con transferencia** (precio del local − descuento). Los
  dos se ajustan en Configuración del ERP, no acá.
- La card y el detalle muestran el precio con Mercado Pago y, debajo, "$X con
  transferencia" cuando es menor. El carrito y el mensaje de WhatsApp usan esos
  mismos precios.

| Qué devuelve el ERP para el SKU     | Qué ve el cliente                                       |
| ----------------------------------- | ------------------------------------------------------- |
| Precio y stock                      | Precio y "Agregar al carrito"                           |
| Precio sin stock                    | Precio, "Sin stock" y "Consultar por WhatsApp"          |
| Nada (SKU desconocido o sin precio) | "Consultar precio" y "Consultar por WhatsApp"           |
| El ERP no responde / sin clave      | "Consultar precio" en todos los productos               |
| Todavía cargando                    | Un skeleton en lugar del precio; el botón deshabilitado |

**El `price` del JSON no se muestra nunca y no se mantiene.** El JSON-LD de la
página de detalle (lo que lee Google) usa el precio y el stock del ERP, igual que
la página; el `price` del JSON solo entra ahí si el ERP no dio precio.

## Si cambiás un SKU en el ERP

Cambialo también en `products.json`. Si no, el ERP no devuelve ese producto y
el sitio lo muestra como "Consultar precio". Para detectarlo, el sitio escribe
en la consola del navegador:

```
[precios] El ERP no devolvió estos SKU: ...
```

Cuando exista la ficha de tienda en el ERP (camino 2) el JSON desaparece y esto
deja de hacer falta.

---

## El script de precios de Mercado Libre (heredado)

`pnpm precios:informe` / `pnpm precios:aplicar` siguen existiendo y hacen lo de
antes **sin ofertas**: escriben `price` (el `PRECIO PAGINA` del export de ML) y
`active` (stock 0 en ML → oculto). Ya no son parte de ninguna rutina: el precio
de venta viene del ERP. Se dejan hasta decidir si se borran.

## El script, paso a paso

### 1. Exportar el CSV desde Mercado Libre

Desde el panel de ML, exportar la planilla de publicaciones. Guardarla como CSV.
El script espera las columnas del export (`ITEM_ID`, `TITLE`, `STOCK_FLEX`,
`PRICE`, `SALE_PRICE`) más **`PRECIO PAGINA`**, que en el template ocupa el lugar
de `VALUE_ADDED_TAX`.

`PRECIO PAGINA` es el precio para la web y lo calcula la planilla, no el script:
es el precio vigente de ML menos 10%. **La web queda 10% más barata que ML.**

### 2. Mirar el informe antes de tocar nada

> **Requiere Node 22 o superior.** El script se ejecuta como TypeScript directo,
> sin paso de build, y eso depende del type stripping nativo de Node 22. Con Node
> 20 falla al parsear el archivo. El resto del proyecto sí corre con Node 20.

```bash
pnpm precios:informe "ruta/al/Precios_23_09.csv"
```

No escribe nada. Imprime cuatro listas:

- **Cambios de precio**, ordenados por magnitud de la variación. Los más grandes
  arriba, que son los que hay que mirar.
- **Sin stock, quedan ocultos** — pasan a `active: false`.
- **Productos nuevos en el export** — los lista, no los crea.
- **El export no los menciona, quedan intactos** — productos de la web que ML no
  reporta. Vale la pena revisar por qué.

Este paso no es opcional. Los precios son plata: una columna corrida en la
planilla se ve acá, y no después en el sitio publicado.

### 3. Aplicar

```bash
pnpm precios:aplicar "ruta/al/Precios_23_09.csv"
```

Reescribe `src/data/products.json`.

### 4. Validar y revisar el diff

```bash
pnpm validate:products
git diff src/data/products.json
```

### 5. Quality gate y publicar

```bash
pnpm lint && pnpm typecheck && pnpm format:check && pnpm test
```

Commit y push a `main`. El CI compila, publica en Cloudflare Pages y verifica el
sitio: ver [`deploy-y-ci.md`](./deploy-y-ci.md).

---

## Qué hace el script exactamente

[`scripts/actualizar-precios.ts`](../../scripts/actualizar-precios.ts) es la
entrada y salida; la lógica pura vive en
[`scripts/lib/precios.ts`](../../scripts/lib/precios.ts) y está cubierta por
[`tests/unit/actualizarPrecios.test.ts`](../../tests/unit/actualizarPrecios.test.ts).

**Agrupa duplicados de ML.** El mismo producto suele tener varias publicaciones
(el export de septiembre traía 63 publicaciones para 43 productos). Agrupa por
título normalizado —sin mayúsculas, acentos ni puntuación—, toma como
representante la publicación con más stock, y suma el stock de todas.

**Vincula con el catálogo por `id`, y si no coincide, por título.** Así reconoce
los productos con id `MLAU` que en el export figuran con otro id. Cuando vincula
por título, **conserva el id que ya tenía la web**: cambiarlo rompería los links
compartidos y la carpeta de imágenes.

**Escribe `price` = `PRECIO PAGINA`** (sin ofertas: el precio de venta viene del
ERP).

**Redondea a pesos enteros**, medio hacia arriba. El esquema del catálogo rechaza
centavos.

**Stock 0 → `active: false`.** El producto desaparece de Home, Catálogo y Detalle
pero sigue en el JSON. Si vuelve el stock, el mismo script lo vuelve a publicar.

### Qué NO toca

`sku`, `name`, `description`, `images`, `category` e `isBestseller`
quedan intactos siempre. Los títulos y textos de la web están mejor redactados que
los de ML —los de ML están escritos para el buscador de ML— y las imágenes y
categorías no existen en el CSV. Hay un test que lo garantiza.

---

## Productos nuevos

El script los detecta y los lista, pero **no los crea**. Faltan tres campos que el
esquema exige para un producto activo: categoría, descripción e imágenes.

Ojo con los falsos positivos: en el export de septiembre, de 20 publicaciones
"nuevas", unas 17 eran duplicados de ML de productos que ya estaban en la web. Un
producto es realmente nuevo solo si no lo reconocés del catálogo.

Para dar de alta cada uno, seguir [`agregar-producto.md`](./agregar-producto.md).
Las categorías válidas son las que ya usa el catálogo: `Iluminación Inteligente`,
`Seguridad`, `Confort`, `Protección y Alertas`, `Hubs`.

---

## Lo que todavía es manual

Que quede claro para no buscar una automatización que no existe:

- **Exportar el CSV desde ML** — a mano, desde el panel.
- **Crear productos nuevos** — a mano, con imágenes y textos propios.
- **Depurar publicaciones duplicadas** — se arregla en Mercado Libre, no acá.

Automatizar las altas tomando datos directo de Mercado Libre quedó **pendiente**.
La API pública devuelve 403 sin credenciales, y antes de encarar eso hay una
decisión de fondo sin tomar: si la web es un espejo de ML o mantiene identidad
editorial propia. Hoy mantiene identidad propia, y por eso el script no pisa
textos ni imágenes.
