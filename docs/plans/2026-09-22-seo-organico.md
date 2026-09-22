# Plan: SEO orgánico — aparecer en búsquedas de domótica

**Fecha:** 2026-09-22
**Estado:** pendiente de arrancar (bloque 1)
**Objetivo del dueño:** "que mi página aparezca más cuando busquen domótica"

> Plan de trabajo, no verdad de dominio. Para contexto de negocio ver
> [`DOMAIN.md`](../../DOMAIN.md).

---

## Punto de partida

Hoy el tráfico llega casi todo de Instagram, directo a la home. Google es un
canal nuevo, no una mejora de uno existente.

Lo que encontramos al revisar:

| Qué                       | Estado hoy                                                |
| ------------------------- | --------------------------------------------------------- |
| `public/robots.txt`       | Dos líneas, sin referencia a sitemap                      |
| `sitemap.xml`             | No existe                                                 |
| `<title>` y `description` | Fijos en `index.html`: las 48 rutas comparten "EzyHome"   |
| Datos estructurados       | No hay                                                    |
| URL canónica              | No hay                                                    |
| Velocidad                 | Critical path 93 kB gzip, con presupuesto de 105 kB en CI |
| Blog                      | 2 artículos                                               |

---

## Dos correcciones conceptuales

**Googlebot ejecuta JavaScript.** Renderiza SPAs. Para aparecer en búsquedas,
prerenderizar **no es un requisito**. Es una mejora de confiabilidad, no la
puerta de entrada.

**Los crawlers sociales no.** WhatsApp, Instagram y Facebook leen el HTML crudo
que sirve el servidor y no ejecutan JS. Para que un producto compartido muestre
título, precio e imagen, sí hace falta prerender. Es otro problema, con otra
prioridad: ver [`ezyhome-seo-prerender-pendiente`](#) en las notas del proyecto.

Resumen: los meta tags dinámicos sirven para Google y no sirven para WhatsApp.

---

## Expectativa realista

**No vamos a rankear por "domótica" a secas.** Esa búsqueda la tienen los
marketplaces y los retailers grandes, con años de autoridad y miles de enlaces.

Donde EzyHome puede ganar es en búsquedas específicas, que además traen gente
con intención de compra:

- "sensor de gas wifi para departamento"
- "domótica sin romper paredes alquiler"
- "cómo instalar foco inteligente wifi"
- "cerradura inteligente argentina precio"

**Plazo:** 3 a 6 meses hasta ver movimiento real, y asumiendo que se suma
contenido en el medio. Instagram va a seguir siendo el canal principal durante
buena parte de ese tiempo.

---

## Bloque 1 — Higiene técnica (1-2 h, es lo de mañana)

Condición necesaria: sin esto Google no sabe qué hay ni cómo mostrarlo. Se hace
una vez y no caduca.

- [ ] **`sitemap.xml` generado en el build** desde `src/data/products.json` y
      `src/data/blog/index.json`. Hoy Google tiene que descubrir las 40 fichas
      tropezándose con links internos. Solo productos con `active: true`.
- [ ] **`robots.txt`** apuntando al sitemap.
- [ ] **Título y meta description por página.** Hook propio de ~20 líneas
      (`useDocumentMeta`), sin librería: el presupuesto de bundle tiene 12 kB
      de margen y conviene no gastarlos acá. - Producto: `<nombre> — EzyHome`, description del `description` del producto. - Catálogo, blog, artículos, institucionales: uno por página.
- [ ] **URL canónica** por página.
- [ ] **JSON-LD `Product`** en la ficha: nombre, imagen, precio, moneda ARS,
      disponibilidad. Es lo que habilita que Google muestre el precio en el
      resultado.
- [ ] Corregir la description de `index.html`: dice "domotica" y
      "automatizacion", sin tildes.

**Restricciones del repo que aplican:** tests primero (rojo antes que verde),
capas y `index.ts` (lo aplica ESLint), presupuesto de 105 kB gzip verificado en
CI, y el quality gate completo antes de cerrar.

**Dato que falta para arrancar:** el dominio real del sitio, para el sitemap y
las canónicas. Si todavía no está definido, entra como `VITE_SITE_URL` con un
valor por defecto y se cambia después.

---

## Bloque 2 — Contenido (continuo, no es trabajo de código)

**Es el 70% del resultado y hoy es lo más flojo: 2 artículos.**

Cada artículo que responde bien una pregunta concreta es una puerta de entrada
nueva. La fuente de temas ya existe: **las preguntas que llegan por WhatsApp**.
Cada duda que se repite es un artículo.

Formato que ya soporta el repo: Markdown en `src/data/blog/` más una entrada en
`index.json` (ver [`docs/adrs/F001-003-blog-static-markdown.md`](../adrs/F001-003-blog-static-markdown.md)).

Ritmo sostenible > ráfaga. Dos artículos por mes durante seis meses rinde mucho
más que diez en una semana y después nada.

---

## Bloque 3 — Prerender (proyecto aparte, ~1 día)

Genera un HTML ya lleno por ruta, en el build. Qué habilita:

- Previews correctos al compartir un producto por WhatsApp o Instagram.
- Indexación más confiable y rápida (Google no depende de renderizar).
- Mejor LCP.

Puntos ásperos a resolver cuando se encare:

- El build renderiza en Node, donde no existen `window` ni `localStorage`:
  `CartProvider` lee `localStorage` al inicializar y hay que hacerlo tolerante.
- Las rutas de producto son dinámicas: el generador lee `products.json`.
- Elegir herramienta (`vite-react-ssg` o equivalente) y meterla en el pipeline.

**Cuándo:** cuando el contenido justifique la inversión, o cuando compartir
productos por WhatsApp se vuelva un canal deliberado. No antes.

---

## Fuera de código (vale más que varias horas de desarrollo)

- [ ] **Google Search Console.** Gratis. Es donde se ve si Google está
      indexando y qué búsquedas traen gente. Sin esto, todo lo demás es a
      ciegas.
- [ ] **Perfil de Google Business**, si hay anclaje geográfico en la venta.

---

## Orden de ataque

1. Bloque 1 completo (mañana).
2. Search Console, para poder medir.
3. Bloque 2 como hábito.
4. Bloque 3 cuando 1 y 2 estén asentados.
