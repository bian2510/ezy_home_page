# Llamadas al backend (ERP)

**Decisión registrada en:** [`docs/adrs/ADR-005-precio-y-stock-desde-el-erp.md`](../adrs/ADR-005-precio-y-stock-desde-el-erp.md)
**Ver también:** [`capas-arquitectura.md`](./capas-arquitectura.md), [`gestion-estado.md`](./gestion-estado.md), [`testing.md`](./testing.md)

Implementación de referencia: `src/features/pricing/` (`storeApi.ts` →
`PricingProvider.tsx` → `usePricing.ts`) y, para envíos con errores por
campo, `src/features/checkout/` (`ordersApi.ts` → `useCreateOrder.ts`).

---

## Reglas

### 1. `fetch` solo en un archivo `<recurso>Api.ts`

Cada recurso del backend tiene **un** archivo `<recurso>Api.ts` dentro de la
feature que lo usa (`features/pricing/storeApi.ts`). Es el **único** lugar con
`fetch`. Ningún componente, hook, Provider ni util llama `fetch`.

Lo aplica `eslint.config.js` en `src/**`, con excepción solo para
`src/features/<feature>/*Api.ts` (raíz de la feature; no `lib/`, `pages/` ni subcarpetas):
`fetch` (también `window.fetch`, `self.fetch`, `globalThis.fetch` y con
corchetes), `XMLHttpRequest`, `EventSource`, `WebSocket` y
`navigator.sendBeacon` fallan `pnpm lint`. `tests/unit/eslint-fetch-rule.test.ts`
verifica cada forma en un `.ts` y en un `.tsx`, y a qué rutas alcanza la
excepción.

La excepción es por nombre: el sufijo `Api.ts` queda reservado para clientes
del backend. Un archivo que no es cliente no se llama `...Api.ts`.

### 2. El archivo `Api` traduce y valida

- Recibe la respuesta del backend y devuelve tipos del sitio: `snake_case` →
  `camelCase` (`price_mp` → `priceMp`).
- Valida la forma de cada entrada con un type guard; lo que no tiene la forma
  esperada se descarta, no se castea.
- Un status que no es `2xx` **tira** un error. Quien llama decide qué mostrar.
- Respeta los límites del backend (lotes de 200 SKU en la tienda) para que el
  resto del sitio no los conozca.
- El tipo crudo del backend (`ErpProduct`) no sale del archivo.

### 3. URL y clave solo por `src/lib/env.ts`

La base de la API y la clave se leen con funciones de `lib/env.ts`
(`getStoreApiUrl`, `getStoreApiKey`) y se pasan como parámetro al archivo `Api`.
Nunca `import.meta.env` directo ni URLs escritas en el código.

### 4. Las variables `VITE_*` son públicas

Todo `VITE_*` queda en el bundle. Una clave que viaja al browser solo puede dar
permisos de lectura de datos que ya son públicos. Un secreto real (token de
Mercado Pago, credenciales) **nunca** va al sitio: vive en el ERP.

### 5. El estado de la llamada vive en la feature

La llamada se hace en un Provider de la feature (patrón de
[`gestion-estado.md`](./gestion-estado.md)) y los componentes leen por el hook
(`usePricing`). El estado es explícito: `loading`, `ready` o `unavailable`.
Las reglas de qué mostrar en cada estado son funciones puras (`pricingUtils.ts`).

Una llamada que dispara el visitante (enviar un pedido) o que es de una sola
página (leer un pedido por su token) no necesita Provider: vive en un hook de la
feature (`checkout/useCreateOrder.ts`, `checkout/useOrder.ts`) con su estado
explícito (`idle` / `submitting` / `failed`; `loading` / `ready` / `not_found` /
`unavailable`). Igual llama al archivo `Api`, nunca a `fetch`.

### 6. Si falla, la UI no inventa datos

Sin respuesta del backend se muestra un estado propio ("Consultar precio"),
nunca un valor de respaldo viejo (el precio del JSON se eliminó por eso). Lo
que falta se avisa con `console.warn` con prefijo de la feature (`[precios]`).

### 7. Tests sin red

- Los tests del archivo `Api` mockean `fetch` (`vi.stubGlobal('fetch', ...)`) y
  cubren ruta feliz y triste: respuesta OK, status de error, entradas con forma
  inválida, lotes.
- El Provider se testea con `fetch` mockeado, incluida la red caída
  (`mockRejectedValue`) y la falta de clave; los componentes, con el hook de la
  feature mockeado ([`testing.md`](./testing.md), Patrón 4).
- Las variables se fijan con `vi.stubEnv` y se limpian con `vi.unstubAllEnvs`.

### 8. El contrato se cambia en los dos repos

Endpoint, parámetros, campos y códigos de error están en el ADR del sitio
(ADR-005) y en el del ERP (ADR-025). Un cambio se decide y documenta en los
dos, y el ERP lo despliega antes que el sitio.

---

## Checklist para una llamada nueva

1. ¿Hay ADR o sección en ADR-005 con el contrato? Si no, escribirla.
2. Archivo `features/<feature>/<recurso>Api.ts` con tipos del sitio, type
   guard y error en status no `2xx`.
3. Variables nuevas en `lib/env.ts`, `vite-env.d.ts`, `.env.example` y el job
   `build` de `ci.yml` ([`deploy-y-ci.md`](../guides/deploy-y-ci.md)).
4. Provider + hook en la feature, estado explícito y qué se muestra si falla.
5. Tests con `fetch` mockeado, feliz y triste.
