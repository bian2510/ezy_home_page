# Protocolo de Trabajo para Agentes de IA

Este documento complementa `CLAUDE.md` con reglas operativas detalladas.
`CLAUDE.md` tiene las reglas de alto nivel. Este documento tiene el workflow paso a paso.

---

## Fase 1 — Antes de escribir una línea de código

**Siempre, sin excepción:**

1. Leer `DOMAIN.md` — entender qué hace EzyHome y sus restricciones de negocio.
2. Leer `PROJECT.md` — entender dónde están las cosas en el repo.
3. Consultar la tabla de navegación en `CLAUDE.md` — identificar el doc específico a la tarea.
4. Leer cada archivo que vas a modificar. **Nunca asumir su contenido.**

```
DOMAIN.md → PROJECT.md → CLAUDE.md (tabla) → doc específico → archivo a editar
```

---

## Fase 2 — Antes de crear algo nuevo

### Crear una función

1. Buscar si ya existe: `grep -r "nombreFuncion" src/lib/ src/features/`
2. Determinar dónde va: ver [`docs/standards/funciones-utils.md`](./standards/funciones-utils.md)
3. Si existe algo similar en 2+ lugares → extraer antes de agregar más duplicación

### Crear un componente

1. Ver [`docs/standards/componentes-ui-vs-feature.md`](./standards/componentes-ui-vs-feature.md) para decidir dónde va
2. Ver [`docs/standards/reglas-componentes.md`](./standards/reglas-componentes.md) para los límites de complejidad
3. El componente nuevo va acompañado de su test

### Crear una feature

1. Leer [`docs/standards/modulos-feature.md`](./standards/modulos-feature.md) completo
2. Seguir el paso a paso en [`docs/guides/agregar-feature.md`](./guides/agregar-feature.md)
3. Crear el `index.ts` desde el primer día — es obligatorio

### Agregar estado global

1. Leer [`docs/standards/gestion-estado.md`](./standards/gestion-estado.md) — define cuándo usar Context vs `useState` vs Zustand
2. Seguir el patrón: `Context.ts` → `Provider.tsx` → `useX.ts`

---

## Fase 3 — Al tomar decisiones

**Escala de autonomía:**

| Situación                                             | Acción                                    |
| ----------------------------------------------------- | ----------------------------------------- |
| < 3 archivos afectados, cambio claro y acotado        | Proceder directamente                     |
| > 5 archivos afectados, o toca tipos compartidos      | Proponer plan antes de implementar        |
| Código que viola un estándar, **fuera del scope**     | Reportarlo, no corregirlo silenciosamente |
| Regla del estándar en conflicto con lógica de negocio | Escalar al usuario                        |
| Decisión de arquitectura no cubierta por los ADRs     | Escalar al usuario                        |

**Leer los ADRs relevantes** antes de tocar arquitectura:

- `ADR-004` — Arquitectura en capas (qué importa de qué)
- `F001-001` — Por qué Context para el carrito
- `F001-002` — Tokens de diseño Tailwind
- `F001-003` — Blog estático con Markdown

---

## Fase 4 — Anti-patrones específicos para agentes

Los siguientes errores se han observado o son de alto riesgo. Verificar activamente que no ocurren:

**Estructura:**

- NO crear archivos de utilidad en raíz de `src/` sin justificación (va en `lib/` o en la feature)
- NO crear una carpeta `helpers/`, `common/`, `shared/` — la arquitectura en capas cubre esos casos
- NO importar de rutas internas de una feature (`@/features/cart/cartUtils`) — importar del `index.ts`

**Lógica:**

- NO copiar lógica de un lugar a otro — si hace falta en dos sitios, extraer
- NO crear más de un Context por feature salvo justificación explícita
- NO usar `useEffect` para transformar datos — usar `useMemo` o función pura

**Datos:**

- NO modificar `products.json` sin verificar que el resultado sigue respetando la interfaz `Product` en `src/types/index.ts`
- NO inventar valores para campos opcionales como `promotionBadge` o `manualUrl` — solo agregarlos si son reales

**Código:**

- NO dejar `console.log` en código de producción
- NO usar `any` en TypeScript — usar `unknown` + type guards
- NO agregar `max-w-prose`, `max-w-3xl`, ni otros anchos de página distintos a `max-w-content`

**Control de versiones:**

- NO commitear sin pasar el quality gate completo (`pnpm lint && pnpm typecheck && pnpm format:check`)
- NO modificar `DOMAIN.md` o `PROJECT.md` sin instrucción explícita del usuario

---

## Fase 5 — Cuándo parar y preguntar

Parar y escalar al usuario cuando:

- La tarea requiere crear una **categoría de producto nueva** (decisión de negocio)
- La tarea modifica `src/types/index.ts` de forma que **rompe más de 3 archivos**
- La tarea requiere una **decisión de arquitectura** no cubierta por los ADRs existentes
- El resultado esperado es **ambiguo** (dos interpretaciones razonables posibles)
- Encontrás un archivo o patrón que **no encaja** en ninguna capa documentada

---

## Quality Gate — checklist de cierre

Antes de declarar cualquier tarea como terminada:

```bash
pnpm lint          # 0 errores
pnpm typecheck     # 0 errores
pnpm format:check  # 0 diffs
```

Si alguno falla, corregir antes de reportar como completo. No es válido decir "el CI lo va a detectar".

---

## Índice de documentos por tipo de tarea

| Tarea                                          | Documento                                                                                 |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Cualquier archivo `.tsx`/`.ts`                 | [`docs/frontend-conventions.md`](./frontend-conventions.md)                               |
| Decidir dónde va un componente                 | [`docs/standards/componentes-ui-vs-feature.md`](./standards/componentes-ui-vs-feature.md) |
| Componente con muchas props o que crece        | [`docs/standards/reglas-componentes.md`](./standards/reglas-componentes.md)               |
| Escribir una función reutilizable              | [`docs/standards/funciones-utils.md`](./standards/funciones-utils.md)                     |
| Crear o modificar una feature                  | [`docs/standards/modulos-feature.md`](./standards/modulos-feature.md)                     |
| Agregar estado global                          | [`docs/standards/gestion-estado.md`](./standards/gestion-estado.md)                       |
| Agregar imágenes o PDFs                        | [`docs/standards/assets-estaticos.md`](./standards/assets-estaticos.md)                   |
| Agregar un producto                            | [`docs/guides/agregar-producto.md`](./guides/agregar-producto.md)                         |
| Agregar el PDF de instrucciones de un producto | [`docs/guides/agregar-pdf-manual.md`](./guides/agregar-pdf-manual.md)                     |
| Crear una feature nueva                        | [`docs/guides/agregar-feature.md`](./guides/agregar-feature.md)                           |
| Entender la arquitectura                       | [`docs/standards/capas-arquitectura.md`](./standards/capas-arquitectura.md)               |
| Entender una decisión técnica                  | [`docs/adrs/`](./adrs/)                                                                   |
