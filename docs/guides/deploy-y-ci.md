# Deploy y CI — cómo se publica el sitio

Cómo llega un commit a producción, qué lo verifica, y qué hacer cuando algo falla.

---

## Lo esencial en tres líneas

- El sitio vive en **Cloudflare Pages**, proyecto `ezyhome-storefront`, hoy en
  `https://ezyhome-storefront.pages.dev`.
- **Se publica solo**, desde GitHub Actions, en cada push a `main` que pase lint,
  typecheck, tests y build.
- **No hay deploy manual desde tu máquina.** Si querés publicar, mergeás a `main`.

El `Dockerfile`, `docker-compose.yml` y `nginx.conf` que están en la raíz **no
participan del deploy**. Sirven para levantar el bundle en un contenedor local y
nada más. Producción es estática en Cloudflare: no hay nginx nuestro, no hay
servidor, no hay EC2.

---

## El pipeline

`.github/workflows/ci.yml` corre en cada push y cada PR contra `main`:

| Job         | Qué hace                                                                  | De qué depende              |
| ----------- | ------------------------------------------------------------------------- | --------------------------- |
| `lint`      | `pnpm format:check` y `pnpm lint`                                         | —                           |
| `typecheck` | `pnpm typecheck`                                                          | —                           |
| `test`      | `pnpm test:coverage`, sube el reporte como artefacto (7 días)             | —                           |
| `build`     | `pnpm build` + `pnpm check:bundle`, sube `dist/` como artefacto (14 días) | `lint`, `typecheck`, `test` |
| `deploy`    | Publica `dist/` en Cloudflare Pages y corre el smoke test                 | `build`                     |

Los tres primeros corren en paralelo. `build` espera a que los tres estén en
verde, así que **un test roto nunca llega a compilar, y mucho menos a publicarse**.

`deploy` tiene además un guard propio:

```yaml
if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```

Un PR corre todo el pipeline pero no publica. Solo el push a `main` publica.

### Por qué `deploy` hace checkout si no compila

El job baja `dist/` como artefacto —no recompila, para publicar exactamente el
build que se verificó— pero necesita el repo en el workspace para correr
`scripts/smoke-test.sh`. Sin `actions/checkout@v4` el script no existe y el job
muere con `exit 127`.

### Por qué `packageManager: npm` en wrangler-action

Con el repo en el workspace, `cloudflare/wrangler-action` ve `pnpm-lock.yaml` e
intenta instalar wrangler con pnpm. Ese job nunca instaló pnpm (solo `build` lo
hace), así que falla con `Unable to locate executable file: pnpm`. Forzar npm
resuelve: es una instalación de una sola herramienta, no del proyecto.

---

## Secrets que el pipeline necesita

Se configuran en GitHub › Settings › Secrets and variables › Actions:

| Secret                  | Quién lo usa | Para qué                                  |
| ----------------------- | ------------ | ----------------------------------------- |
| `VITE_WHATSAPP_NUMBER`  | job `build`  | Número de checkout, embebido en el bundle |
| `CLOUDFLARE_API_TOKEN`  | job `deploy` | Autenticación con Cloudflare              |
| `CLOUDFLARE_ACCOUNT_ID` | job `deploy` | Cuenta destino                            |

Si `VITE_WHATSAPP_NUMBER` falta, el build **no falla**: publica un sitio donde el
botón de WhatsApp no lleva a ningún lado. Ver [`src/lib/env.ts`](../../src/lib/env.ts).

---

## El smoke test

Un deploy en verde no significa que el sitio quedó bien.
[`scripts/smoke-test.sh`](../../scripts/smoke-test.sh) corre después de publicar y
verifica tres cosas contra el dominio real:

1. Responde 200 y devuelve el HTML de la app.
2. El bundle que ese HTML referencia también responde 200.
3. El dominio sirve **el build recién publicado**, comparando el hash del asset
   contra el `DEPLOY_URL` que devuelve wrangler.

El punto 3 es el que justifica todo el script. Sin él, un deploy que se subió pero
no se promovió al dominio pasa inadvertido — que es exactamente cómo el sitio
estuvo seis semanas sirviendo una versión vieja sin que nadie lo notara.

Reintenta hasta 10 veces cada 6 segundos (`MAX_INTENTOS`, `ESPERA_SEG`), porque la
propagación de Cloudflare no es instantánea.

Correrlo a mano en cualquier momento:

```bash
bash scripts/smoke-test.sh
SITE_URL=https://otro-dominio.pages.dev bash scripts/smoke-test.sh
```

---

## El presupuesto de peso

`build` corre [`scripts/check-bundle-size.js`](../../scripts/check-bundle-size.js),
que mide en gzip los assets que `dist/index.html` referencia —el critical path, lo
que el visitante descarga antes de ver la primera pantalla— y falla si pasa los
**105 kB**. Hoy usa 93 kB.

Si una dependencia nueva lo rompe: moverla detrás de un `lazy()`, buscar una
alternativa más liviana, o subir el tope explicando por qué en el commit. Subirlo
sin justificación convierte el presupuesto en decoración.

---

## Cuando el deploy sale mal

**Un CI que falla no tira el sitio abajo.** Cloudflare sigue sirviendo el último
deployment que se promovió; un job roto simplemente no publica nada nuevo. Lo que
sí rompe es un deploy que publica algo malo.

### Volver atrás (rollback)

Es manual y toma un clic:

> Panel de Cloudflare › Workers & Pages › `ezyhome-storefront` › **Deployments** ›
> el último deployment que funcionaba › **Rollback to this deployment**

Es instantáneo: reapunta el dominio al build anterior, no recompila nada. El
mensaje de error del smoke test repite estas instrucciones, para no tener que
buscar esta página en medio del incidente.

**Por qué el rollback no es automático:** el smoke test puede dar un falso
positivo —una intermitencia de red, propagación lenta— y revertir solo dejaría el
sitio en un estado que nadie decidió, sin nadie mirando. Un humano mira treinta
segundos y decide. La contrapartida es que alguien tiene que enterarse de que
falló; hoy eso es el mail de GitHub Actions.

### Diagnóstico rápido

| Síntoma                                    | Dónde mirar                                                             |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| `deploy` no corrió                         | ¿Fue un PR? Solo publica el push a `main`.                              |
| `build` falla y en local anda              | Casi siempre `pnpm install --frozen-lockfile`: lockfile desactualizado. |
| `check:bundle` falla                       | Entró una dependencia al critical path. Ver sección anterior.           |
| Smoke test falla en el punto 3             | El deploy no se promovió. Revisar el panel de Cloudflare.               |
| El sitio anda pero el botón de WhatsApp no | Falta el secret `VITE_WHATSAPP_NUMBER`.                                 |

---

## Seguridad

`.github/workflows/security.yml` corre en cada push, cada PR y todos los lunes 7:00 UTC:

- **Gitleaks** — escaneo de secrets en el historial completo (`fetch-depth: 0`).
- **`pnpm audit --prod --audit-level=high`** — solo dependencias de producción; las
  de desarrollo no viajan al bundle.

---

## Antes de que llegue al CI

Las mismas barreras corren en tu máquina, para que el CI sea confirmación y no
descubrimiento:

| Momento      | Qué corre                                          | Dónde               |
| ------------ | -------------------------------------------------- | ------------------- |
| `git commit` | `lint-staged`: `eslint --fix` + `prettier --write` | `.husky/pre-commit` |
| mensaje      | commitlint (Conventional Commits)                  | `.husky/commit-msg` |
| `git push`   | `pnpm typecheck && pnpm test`                      | `.husky/pre-push`   |

Y el quality gate completo, obligatorio antes de dar cualquier tarea por terminada:

```bash
pnpm lint && pnpm typecheck && pnpm format:check && pnpm test
```

No es válido pushear con la intención de "el CI lo va a detectar".

---

## Historia útil

El deploy usaba `cloudflare/pages-action`, que Cloudflare retiró: el repo de la
acción devuelve 404 y el job empezó a fallar con `Unable to resolve action`. Como
nadie miraba los mails del CI y el sitio seguía en pie —sirviendo el build viejo—
el problema pasó inadvertido **seis semanas**. El reemplazo oficial es
`cloudflare/wrangler-action@v4` con el comando `pages deploy`.

De ahí sale el smoke test: la lección no fue "esa acción se rompió", fue "nadie se
entera de que producción quedó vieja".
