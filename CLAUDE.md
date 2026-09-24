# Agent Working Rules — EzyHome

## First: Read These Two Files

Before taking any action in this repository, read in order:

1. `DOMAIN.md` — business domain, constraints, and design implications
2. `PROJECT.md` — where things live and how the repo is structured

Do not skip this step. Context you skip becomes an assumption you will regret.

---

## Source Discipline

- Cite sources from `docs/sources/` or `DOMAIN.md`; do not invent facts.
- If you need to make a factual claim about the business and cannot find a source, say so — do not fabricate.
- If source material is ambiguous or missing, escalate to the user rather than guessing.

---

## Edit Discipline

- Read before you write. Use your read tool; never assume file contents.
- Prefer targeted edits over full rewrites. Change the minimum necessary.
- Do not modify files outside your task's stated scope unless blocking.
- Do not silently delete code. If removing, explain why in your response.

---

## Communication Rules

- State what you are about to do before you do it.
- When you finish a task, summarize what changed and what the caller should do next.
- If you discover a blocker, stop and report it immediately — do not work around it silently.
- Flag unclear requirements as questions, not assumptions.

---

## Boundaries

- Do not make architectural decisions unilaterally. Flag them for the architect or SEM.
- Do not modify `DOMAIN.md` or `PROJECT.md` without explicit user instruction.
- Do not modify test files unless your task explicitly covers testing.
- Do not commit or push to version control unless your task explicitly requires it.

---

## Navigation — Qué leer según la tarea

Después de leer `DOMAIN.md` y `PROJECT.md`, leer el doc específico a tu tarea:

| Tarea                                                  | Leer antes de empezar                                                                        |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Crear o modificar cualquier archivo `.tsx`/`.ts`       | [`docs/frontend-conventions.md`](docs/frontend-conventions.md)                               |
| Decidir dónde poner un componente                      | [`docs/standards/componentes-ui-vs-feature.md`](docs/standards/componentes-ui-vs-feature.md) |
| Componente con muchas props o que crece en líneas      | [`docs/standards/reglas-componentes.md`](docs/standards/reglas-componentes.md)               |
| Escribir una función reutilizable / evitar duplicación | [`docs/standards/funciones-utils.md`](docs/standards/funciones-utils.md)                     |
| Escribir o corregir tests                              | [`docs/standards/testing.md`](docs/standards/testing.md)                                     |
| Agregar colores, tipografía o estilos Tailwind         | [`docs/standards/tailwind-tokens.md`](docs/standards/tailwind-tokens.md)                     |
| Crear o modificar una feature                          | [`docs/standards/modulos-feature.md`](docs/standards/modulos-feature.md)                     |
| Agregar estado global o Context                        | [`docs/standards/gestion-estado.md`](docs/standards/gestion-estado.md)                       |
| Agregar imágenes o PDFs a un producto                  | [`docs/standards/assets-estaticos.md`](docs/standards/assets-estaticos.md)                   |
| Agregar un producto nuevo al catálogo                  | [`docs/guides/agregar-producto.md`](docs/guides/agregar-producto.md)                         |
| Actualizar precios o stock desde Mercado Libre         | [`docs/guides/actualizar-precios.md`](docs/guides/actualizar-precios.md)                     |
| Entender el CI, el deploy, o volver atrás un deploy    | [`docs/guides/deploy-y-ci.md`](docs/guides/deploy-y-ci.md)                                   |
| Agregar el PDF de instrucciones de un producto         | [`docs/guides/agregar-pdf-manual.md`](docs/guides/agregar-pdf-manual.md)                     |
| Crear una feature nueva desde cero                     | [`docs/guides/agregar-feature.md`](docs/guides/agregar-feature.md)                           |
| Entender la arquitectura en capas general              | [`docs/standards/capas-arquitectura.md`](docs/standards/capas-arquitectura.md)               |
| Entender por qué se tomó una decisión técnica          | [`docs/adrs/`](docs/adrs/) — ver README en `docs/standards/README.md`                        |
| Protocolo de trabajo detallado para agentes de IA      | [`docs/agents.md`](docs/agents.md)                                                           |

---

## Quality Gate — Obligatorio antes de terminar cualquier tarea

Antes de declarar cualquier tarea como completa, ejecutar siempre en orden:

1. `pnpm lint` — debe terminar con 0 errores
2. `pnpm typecheck` — debe terminar sin errores
3. `pnpm format:check` — debe pasar sin archivos con diff
4. `pnpm test` — debe terminar sin tests fallando

El test va primero en el trabajo, no último: para un bug o un cambio de
comportamiento, escribir el test que falla antes del código que lo arregla.

Si cualquiera falla, corregir antes de commitear.
No es válido pushear con la intención de "el CI lo va a detectar".
