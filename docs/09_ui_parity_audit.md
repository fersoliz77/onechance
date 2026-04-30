# 09 · UI Parity Audit — Mockups vs Implementación

## Fecha
2026-04-30

## Objetivo
Auditar la plataforma completa para detectar desvíos de paridad visual y de interacción contra los mockups oficiales en `OneChance mockup basicos/ui_kits`.

## Fuentes auditadas
- `OneChance mockup basicos/ui_kits/landing/*`
- `OneChance mockup basicos/ui_kits/platform/*`
- `web/src/app/**/*`
- `web/src/components/**/*`

## Cambios aplicados en esta pasada
- Se consolidó el sistema de espaciado/layout con tokens globales en `web/src/app/globals.css`:
  - `--oc-page-pad-x`, `--oc-shell-*`, `--oc-nav-height`, `--oc-nav-offset`
  - `--oc-control-h-*`, `--oc-radius-*`, utilidades `.oc-shell`, `.oc-main-offset`, `.oc-page-block`
- Se normalizó navbar con contenedor interno tokenizado para margen izquierdo/derecho consistente:
  - `web/src/components/layout/Nav.tsx`
- Se corrigió la cinta de landing para acercarla al mockup (altura compacta, texto y bullets más chicos):
  - `web/src/app/page.tsx`
- Se implementó modal contextual de acceso/registro en landing:
  - `web/src/components/landing/AuthModal.tsx`
  - `web/src/app/page.tsx`
- Se alineó el dot de marca del navbar y el dot de la cinta para baseline más consistente:
  - `web/src/components/layout/Nav.tsx`
  - `web/src/app/page.tsx`
- Se unificaron alturas/paddings/radios de controles base:
  - `web/src/components/ui/Button.tsx`
  - `web/src/components/ui/Input.tsx`
  - `web/src/components/ui/Select.tsx`
- Se migraron offsets de páginas a `oc-main-offset` para evitar solape con navbar fijo:
  - `web/src/app/{jugadores,tecnicos,clubes,representantes,admin,dashboard}/page.tsx`
  - `web/src/app/{jugadores,tecnicos,clubes,representantes}/[id]/page.tsx`
- Se migró dashboard a navegación lateral y módulos de perfil:
  - `web/src/app/dashboard/page.tsx`
- Se migró admin a navegación lateral y módulos de administración:
  - `web/src/app/admin/page.tsx`
- Se ajustaron buscadores/filtros en listados para layout más cercano a mockup:
  - `web/src/app/tecnicos/page.tsx`
  - `web/src/app/clubes/page.tsx`
  - `web/src/app/representantes/page.tsx`

## Fases ejecutadas

### Fase P0 (bloqueantes)
✅ Completada
- Landing con modal contextual operativo.
- Dashboard con IA lateral por secciones.
- Admin con IA lateral por secciones.

### Fase P1 (layout/card parity)
✅ Completada
- Rebalanceo de listados hacia búsqueda + filtros inline y mayor limpieza de grilla.
- Homogeneización de contenedores y offsets por tokens.

### Fase P2 (micro refinamiento)
✅ Completada
- Correcciones de baseline en dots (navbar + ticker landing).
- Normalización de controles base (button/input/select) por tokens.

## Hallazgos de paridad (estado actual)

### P0 — Bloqueantes de paridad 1:1
- Landing: modal contextual restaurado.
- Dashboard: IA lateral restaurada.
- Admin: IA lateral restaurada.
- Player detail: sigue pendiente ampliar bloques para cierre 1:1 total.

### P1 — Diferencias de layout y geometría
- Técnicos/Clubes/Representantes: se redujo desvío quitando dependencia de sidebars en layout principal.
- Jerarquía de paneles laterales en algunos details todavía puede afinarse.
- Landing collage de cards está más cerca, con margen de ajuste fino.

### P2 — Refinamientos micro tipográficos y de alineación
- Densidad de chips, labels y metadatos (9/10/11px) no totalmente uniforme entre secciones.
- Algunos dots/líneas de timeline y badges requieren ajuste óptico final por baseline.
- Cadencia de animaciones (ticker/hover/floats) aún no está completamente clonada del mockup.

## Estado de calidad técnica
- Lint ejecutado tras la pasada: **0 errores**, warnings no bloqueantes por imports/variables sin uso.
- La plataforma queda sobre base de tokens consistente para mantener paridad transversal.

## Modularización aplicada
- Componentes reutilizables nuevos:
  - `web/src/components/ui/SurfaceCard.tsx`
  - `web/src/components/ui/SectionKicker.tsx`
  - `web/src/components/ui/PanelHeader.tsx`
  - `web/src/components/ui/InlineFiltersBar.tsx`
  - `web/src/components/ui/EmptyState.tsx`
  - `web/src/components/ui/StatTile.tsx`
- Pantallas migradas parcialmente a estas piezas:
  - `web/src/app/dashboard/page.tsx`
  - `web/src/app/admin/page.tsx`
  - `web/src/app/jugadores/page.tsx`
  - `web/src/app/tecnicos/page.tsx`
  - `web/src/app/clubes/page.tsx`
  - `web/src/app/representantes/page.tsx`

## Puntos débiles de interfaz (actuales)
- Persisten diferencias 1:1 en algunas jerarquías de detail pages (orden de bloques y peso lateral).
- Densidad visual no uniforme en todos los chips/labels de metadatos entre secciones.
- Faltan estados vacíos enriquecidos con CTA contextual en varias vistas.
- El sistema de motion aún no está completamente normalizado por tipo de interacción.
- Existen warnings de lint no bloqueantes que indican deuda de limpieza técnica en imports/variables.

## Plan recomendado para cierre 1:1
1. **Fase A (P0):** Landing+Auth modal, Dashboard completo, Admin completo, Player detail completo.
2. **Fase B (P1):** Rebalanceo de listados y details para coincidir grillas/jerarquías del mockup.
3. **Fase C (P2):** Pulido micro tipográfico y motion parity pixel-perfect.

## Criterio de aceptación final
- Coincidencia visual y de interacción con mockups en desktop y mobile.
- Todos los contenedores/espaciados regidos por tokens (sin drift local).
- `npm run lint` limpio y sin errores.
