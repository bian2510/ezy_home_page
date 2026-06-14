# Engineering Standards — Índice

Convenciones técnicas del proyecto. Cada archivo cubre un tema específico.
Para las reglas de código (TypeScript, Tailwind, testing, nomenclatura) ver [`docs/frontend-conventions.md`](../frontend-conventions.md).

---

## Arquitectura

| Documento                                                        | Cuándo leerlo                                                                                    |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| [`capas-arquitectura.md`](./capas-arquitectura.md)               | Antes de crear cualquier archivo nuevo. Define las 6 capas y qué puede importar de qué.          |
| [`componentes-ui-vs-feature.md`](./componentes-ui-vs-feature.md) | Cuando no sabés si un componente va en `ui/` o en una feature.                                   |
| [`modulos-feature.md`](./modulos-feature.md)                     | Cuando creás o modificás una feature. Define la estructura de carpetas y el contrato `index.ts`. |

## Estado

| Documento                                  | Cuándo leerlo                                                                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| [`gestion-estado.md`](./gestion-estado.md) | Cuando necesitás decidir entre `useState`, `useMemo`, Context, o Zustand. Incluye el patrón Context completo y el plan de migración. |

## Assets

| Documento                                      | Cuándo leerlo                                                                               |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [`assets-estaticos.md`](./assets-estaticos.md) | Cuando agregás imágenes o PDFs a un producto. Define la estructura `public/products/{id}/`. |

---

## Decisiones de arquitectura (ADRs)

Las decisiones tomadas y sus justificaciones viven en [`docs/adrs/`](../adrs/).

| ADR                                                         | Tema                                                     |
| ----------------------------------------------------------- | -------------------------------------------------------- |
| [`F001-001`](../adrs/F001-001-cart-state-react-context.md)  | Por qué React Context para el carrito (no Zustand/Redux) |
| [`F001-002`](../adrs/F001-002-tailwind-token-remapping.md)  | Tokens de diseño EzyHome en Tailwind                     |
| [`F001-003`](../adrs/F001-003-blog-static-markdown.md)      | Blog estático con Markdown (no CMS)                      |
| [`ADR-004`](../adrs/ADR-004-arquitectura-frontend-capas.md) | Arquitectura en capas Feature-Sliced Lite                |
