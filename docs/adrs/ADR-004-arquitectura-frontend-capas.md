# ADR-004: Arquitectura frontend en capas (Feature-Sliced Lite)

**Fecha:** 2026-06-14
**Estado:** Aceptado

---

## Contexto

El repo comenzó con una estructura implícita (`pages/`, `features/`, `components/ui/`). Sin reglas explícitas de qué puede importar qué, los imports cruzados entre features producen acoplamiento difícil de deshacer a medida que el catálogo y las features crecen. Se necesita una arquitectura que:

- Escale sin reorganización mayor cuando se agreguen features nuevas.
- Permita agregar estado global (Zustand, React Query) sin mover archivos.
- Sea lo suficientemente simple para ser seguida por un agente de IA o un desarrollador nuevo.

## Decisión

**Feature-Sliced Lite**: capas unidireccionales con encapsulamiento por feature via `index.ts`.

Ver mapa completo en [`docs/standards/capas-arquitectura.md`](../standards/capas-arquitectura.md).

### Regla central — flujo de dependencias, sin excepciones

```
pages  →  features  →  components/ui  →  lib
                   ↘  types
                   ↘  data
```

Ninguna capa importa de la capa superior. `ui/` nunca importa de `features/`. `lib/` nunca importa de React.

### Encapsulamiento de features

Cada feature expone solo lo necesario via `index.ts`. Las `pages/` y otras features importan únicamente del `index.ts`, nunca de rutas internas.

Ver patrón completo en [`docs/standards/modulos-feature.md`](../standards/modulos-feature.md).

## Justificación

- **FSD completo** requiere nomenclatura y capas adicionales (`entities`, `widgets`) que son overhead para el tamaño actual del proyecto.
- **Sin reglas** (estado actual) produce imports cruzados entre features que se vuelven refactors costosos.
- **Esta variante** toma las dos reglas más valiosas de FSD (flujo unidireccional + encapsulamiento por feature) sin el resto del ceremonial.

## Consecuencias

- Toda feature nueva sigue la estructura definida en [`docs/standards/modulos-feature.md`](../standards/modulos-feature.md).
- Si el proyecto escala a 10+ features con estado compartido, evaluar migración a FSD completo o introducir una capa `entities/`.
- Los imports existentes que violen el flujo unidireccional deben corregirse al tocar esos archivos.

## Alternativas rechazadas

| Alternativa             | Razón de rechazo                                                   |
| ----------------------- | ------------------------------------------------------------------ |
| FSD completo            | Overhead de capas `entities/widgets/app` innecesario a esta escala |
| Sin reglas (implícito)  | Imports cruzados crecientes sin mecanismo de contención            |
| Monolito flat en `src/` | Imposible de navegar con > 30 archivos                             |
