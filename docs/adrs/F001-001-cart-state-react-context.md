# ADR F001-001: React Context + useReducer para estado del carrito

**Feature:** F001 — EzyHome Storefront Page  
**Fecha:** 2026-05-24  
**Estado:** Aceptado

---

## Contexto

EzyHome v1 necesita un carrito de compras persistente entre páginas y sesiones. El estado del carrito debe ser accesible desde la página de catálogo (para agregar items), la página de detalle de producto, la página de carrito, y el header (badge con cantidad). Se evaluaron tres opciones: React Context + useReducer, Zustand, y Redux Toolkit.

## Decisión

**React Context + useReducer** con sincronización a `localStorage` via `useEffect`.

## Justificación

- Un único dominio de estado global (el carrito). Context es suficiente — no hay múltiples stores independientes que justifiquen Zustand.
- Sin dependencia extra de npm. El patrón es idiomático React y cualquier desarrollador React lo conoce.
- La sincronización a localStorage es un `useEffect` de 5 líneas con try/catch — no necesita middleware.
- Redux Toolkit: overhead de setup desproporcionado para un solo slice.
- Zustand: API más simple que Redux pero aún es una dependencia externa. El beneficio (boilerplate menor que Context) no supera el costo de agregar una dependencia en v1.

## Consecuencias

- Si en v2 el carrito escala a múltiples dominios de estado (wishlist, comparación, etc.), evaluar migración a Zustand.
- Los re-renders de Context deben contenerse con `useMemo` en el value del Provider si se detectan problemas de performance (improbable dado el tamaño del estado).
- El patrón `useState init from localStorage` + `useEffect sync` es el estándar documentado para cart persistence en React SPAs sin backend.

## Alternativas rechazadas

| Alternativa | Razón de rechazo |
|---|---|
| Zustand | Dependencia extra sin beneficio real a esta escala |
| Redux Toolkit | Setup desproporcionado para un solo dominio de estado |
| URL params | No persiste entre sesiones; impracticable para carrito |
