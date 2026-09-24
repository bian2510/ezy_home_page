# Actualizar precios y stock desde Mercado Libre

Rutina mensual: los precios reales se manejan en Mercado Libre, y la web se
sincroniza desde el export de ML. No se editan precios a mano en el JSON.

---

## Respuesta corta a "¿cuántos archivos necesito?"

**Uno solo** para la rutina normal: el export de precios de Mercado Libre. Con
eso se actualizan precios, promociones y stock de todo el catálogo.

**Un segundo archivo solo cuando hay productos nuevos**, y lo armás vos a mano:
el export de ML no trae categoría, descripción ni imágenes, y sin esas tres cosas
un producto no puede publicarse. El script te lista cuáles son; crearlos es
trabajo manual siguiendo [`agregar-producto.md`](./agregar-producto.md).

| Archivo                          | Cuándo            | Quién lo genera |
| -------------------------------- | ----------------- | --------------- |
| Export de precios de ML (`.csv`) | Todos los meses   | Mercado Libre   |
| Planilla de productos nuevos     | Solo si hay altas | Vos, a mano     |

---

## La rutina, paso a paso

### 1. Exportar los precios desde Mercado Libre

Desde el panel de ML, exportar la planilla de publicaciones. Guardarla como CSV.
El script espera las columnas del export (`ITEM_ID`, `TITLE`, `STOCK_FLEX`,
`PRICE`, `SALE_PRICE`) más **`PRECIO PAGINA`**, que en el template ocupa el lugar
de `VALUE_ADDED_TAX`.

`PRECIO PAGINA` es el precio para la web y lo calcula la planilla, no el script:
es el precio vigente de ML menos 10%. **La web queda 10% más barata que ML.**

> El CSV es la fuente de verdad del precio. Si el número de la planilla no es el
> que querés publicar, se corrige en la planilla, no en el JSON.

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

**Traduce el precio al contrato de `Product`:**

| Situación en ML           | `price`         | `promotionalPrice` | `isOnSale` |
| ------------------------- | --------------- | ------------------ | ---------- |
| Tiene precio en promoción | precio lista ML | `PRECIO PAGINA`    | `true`     |
| No tiene promoción        | `PRECIO PAGINA` | —                  | `false`    |

Con promoción, el precio tachado que ve el cliente es el de lista real de ML y el
que paga es el de la web. Sin promoción hay un solo precio: anunciar un descuento
que no existe erosiona la confianza, que es el riesgo #1 del negocio
(`DOMAIN.md` › Risk Posture).

Si un producto deja de estar en promoción, **limpia el `promotionalPrice` viejo**.

**Redondea a pesos enteros**, medio hacia arriba. El esquema del catálogo rechaza
centavos.

**Stock 0 → `active: false`.** El producto desaparece de Home, Catálogo y Detalle
pero sigue en el JSON. Si vuelve el stock, el mismo script lo vuelve a publicar.

### Qué NO toca

`name`, `description`, `images`, `category`, `isBestseller` y `promotionBadge`
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
