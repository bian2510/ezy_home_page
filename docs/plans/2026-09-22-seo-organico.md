# Plan: SEO orgánico — aparecer en búsquedas de domótica

**Fecha:** 2026-09-22
**Estado:** bloque 1 **hecho** (2026-09-24). Pendientes: Search Console, bloque 2
(contenido) y bloque 3 (prerender).
**Objetivo del dueño:** "que mi página aparezca más cuando busquen domótica"

> Plan de trabajo, no verdad de dominio. Para contexto de negocio ver
> [`DOMAIN.md`](../../DOMAIN.md).

---

## Punto de partida

Hoy el tráfico llega casi todo de Instagram, directo a la home. Google es un
canal nuevo, no una mejora de uno existente.

Lo que encontramos al revisar:

| Qué                       | Antes (2026-09-22)                                        | Hoy (2026-09-24)                          |
| ------------------------- | --------------------------------------------------------- | ----------------------------------------- |
| `robots.txt`              | Dos líneas, sin referencia a sitemap                      | Generado en el build, apunta al sitemap   |
| `sitemap.xml`             | No existe                                                 | Generado en el build — 39 URLs            |
| `<title>` y `description` | Fijos en `index.html`: las 48 rutas comparten "EzyHome"   | Propios por página (`useDocumentMeta`)    |
| Datos estructurados       | No hay                                                    | `schema.org/Product` en cada ficha        |
| URL canónica              | No hay                                                    | Absoluta, una por página                  |
| Velocidad                 | Critical path 93 kB gzip, con presupuesto de 105 kB en CI | 94 kB gzip — el hook costó ~0,9 kB        |
| Blog                      | 2 artículos                                               | 2 artículos — sin cambios, es el bloque 2 |

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

## Bloque 1 — Higiene técnica ✅ hecho el 2026-09-24

Condición necesaria: sin esto Google no sabe qué hay ni cómo mostrarlo. Se hace
una vez y no caduca.

- [x] **`sitemap.xml` generado en el build** desde `src/data/products.json` y
      `src/data/blog/index.json`, solo `active: true`. Lo emite
      `scripts/vite-plugin-seo.ts`; la lógica pura está en `scripts/lib/sitemap.ts`.
- [x] **`robots.txt`** generado también en el build, apuntando al sitemap y
      excluyendo `/carrito`. Se borró el estático de `public/` para no tener dos
      fuentes de verdad.
- [x] **Título y meta description por página**, con `src/hooks/useDocumentMeta.ts`
      (~60 líneas, sin librería). Las 9 rutas lo llaman.
- [x] **URL canónica** absoluta por página, normalizada (sin query, sin hash, sin
      barra final).
- [x] **JSON-LD `Product`** en la ficha, con precio efectivo en ARS y
      disponibilidad.
- [x] Corregida la description de `index.html`, más og: tags por defecto para que
      un link compartido al menos muestre la marca.
- [x] **Extra no planificado:** `noindex` en carrito y 404, y `VITE_SITE_URL` para
      no tener el dominio hardcodeado.

**Cobertura:** 54 tests nuevos (helpers puros, el hook sobre el DOM, el sitemap y
un integration que verifica que cada ruta real escribe lo suyo).

**Restricciones del repo que aplican:** tests primero (rojo antes que verde),
capas y `index.ts` (lo aplica ESLint), presupuesto de 105 kB gzip verificado en
CI, y el quality gate completo antes de cerrar.

**Sobre el dominio:** entró como `VITE_SITE_URL`, con
`https://ezyhome-storefront.pages.dev` por defecto. Cuando haya dominio propio
se cambia esa variable en el CI y se reenvía el sitemap en Search Console; no
hay que tocar código.

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

1. ~~Bloque 1 completo.~~ Hecho el 2026-09-24.
2. **Search Console** — lo próximo, y no es trabajo de código: lo tiene que crear
   el dueño. Sin esto no se sabe si Google está indexando ni qué búsquedas traen
   gente, y el bloque 2 se hace a ciegas.
3. Bloque 2 como hábito.
4. Bloque 3 cuando 1 y 2 estén asentados.

---

## Qué mirar cuando Search Console esté

- Que las 39 URLs del sitemap queden indexadas (no van a ser todas ni enseguida).
- Que la ficha de producto sea elegible para resultado enriquecido — se prueba en
  el Rich Results Test de Google pegando la URL de un producto.
- Qué consultas traen impresiones: ahí salen los temas del bloque 2.
