# Plan: SEO orgánico — aparecer en búsquedas de domótica

**Fecha:** 2026-09-22
**Estado:** bloque 1 y Search Console **hechos** (2026-09-24). Pendientes: bloque 2
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

**Sobre el dominio:** el storefront se publica en **`https://shop.ezyhome.app`**,
y ese es el valor por defecto. El `ezyhome-storefront.pages.dev` sigue
respondiendo lo mismo —es la dirección interna del proyecto de Cloudflare— pero
no es la que se anuncia. `ezyhome.app` sin el `shop.` es **otra aplicación** del
dueño, ajena a este repo. Si el storefront cambiara de dirección, se define
`VITE_SITE_URL` y no hay que tocar código.

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

- [x] **Google Search Console** — verificado el 2026-09-24. Ver abajo.
- [ ] **Perfil de Google Business**, si hay anclaje geográfico en la venta.

---

## Google Search Console — cómo quedó y qué saber

**Propiedad:** tipo _prefijo de URL_, sobre **`https://shop.ezyhome.app/`**.

La primera propiedad se creó sobre `ezyhome-storefront.pages.dev` antes de saber
que había dominio propio; quedó obsoleta y se puede borrar. También existe la
opción de una propiedad tipo _Dominio_ sobre `ezyhome.app`, que cubriría de una
vez el storefront y la otra aplicación del dueño, pero se verifica por DNS.

**Verificación: meta tag en `index.html`.**

```html
<meta name="google-site-verification" content="…" />
```

**El método de archivo HTML no puede funcionar en este sitio, y conviene saberlo
antes de perder media hora.** Google, antes de dar por buena la verificación,
pide un archivo inventado que no debería existir:

```
GET /google-inexistente-000.html  → 200 + el index.html de la app
```

Esto es una SPA en Cloudflare Pages: cualquier ruta devuelve 200 con el
`index.html`, que es lo que hace andar el ruteo del lado del cliente. Google
recibe 200 donde esperaba 404, concluye que el servidor responde 200 a todo, y
reporta _"your verification file has the wrong content"_ — mensaje engañoso: el
contenido estaba bien, el método es el que no aplica. Se suma que Cloudflare le
saca la extensión a las URLs y `/google….html` respondía 308.

**No borrar la meta tag del `index.html`:** sacarla revierte la verificación y se
pierde el acceso a los informes.

**Sitemap:** enviado como `sitemap.xml`. Si al enviarlo se cuela un `./` u otro
sufijo, Google pide una URL que cae en el catch-all de la SPA, recibe HTML en vez
de XML y reporta _"Couldn't fetch"_. El estado "Couldn't fetch" recién enviado
también es normal: Google lo encola y lo lee horas después.

**Dos direcciones para el mismo contenido:** `shop.ezyhome.app` y
`ezyhome-storefront.pages.dev` sirven lo mismo, y eso podría leerse como
contenido duplicado. Lo resuelven las canónicas: todas apuntan a
`shop.ezyhome.app`, así que Google consolida ahí. No hace falta bloquear el
`pages.dev`.

**Si cambia el dominio:** crear la propiedad nueva en Search Console, definir
`VITE_SITE_URL` y reenviar el sitemap.

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
