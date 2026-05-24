# OneChance — UX/UI V2 Execution Log

> Fecha y hora de ejecución: **2026-05-23 22:58:49**
> Responsable: OpenCode (ejecución técnica)
> Objetivo: aplicar mejoras UX/UI de alto impacto en producción con foco en búsqueda, conversión y claridad operativa.

---

## Alcance aplicado en esta entrega

### 1) Búsqueda más útil para scouts (persistencia local)
- Qué estaba mal:
  - El buscador y filtros funcionaban, pero no recordaban hábitos del usuario.
  - El usuario debía reconstruir búsquedas en cada sesión.
- Qué se implementó:
  - Búsquedas recientes persistidas en `localStorage`.
  - Filtros guardados persistidos en `localStorage`.
  - Acciones para aplicar/eliminar filtros guardados.
- Cómo queda funcionando:
  - El usuario puede retomar búsquedas frecuentes en 1 click.
  - Se reduce fricción en exploración repetitiva (flujo scout).

Archivos:
- `web/src/features/players/hooks/usePlayersListing.ts`
- `web/src/app/jugadores/page.tsx`

---

### 2) UX de resultados vacíos con acción concreta
- Qué estaba mal:
  - Si no había coincidencias, el estado vacío no guiaba claramente el siguiente paso.
- Qué se implementó:
  - Estado vacío reforzado con CTA `Limpiar filtros y búsqueda`.
- Cómo queda funcionando:
  - El usuario tiene salida directa cuando no encuentra resultados.
  - Menor sensación de bloqueo.

Archivo:
- `web/src/app/jugadores/page.tsx`

---

### 3) Conversión móvil en perfil de jugador (CTA sticky)
- Qué estaba mal:
  - En mobile, el CTA principal podía quedar fuera de viewport tras scroll largo.
- Qué se implementó:
  - Barra sticky inferior en mobile con acciones `Seguir` y `Contactar`.
  - Ajuste de padding inferior para no tapar contenido.
- Cómo queda funcionando:
  - Las acciones de conversión quedan siempre visibles en mobile.
  - Aumenta probabilidad de contacto y seguimiento.

Archivo:
- `web/src/app/jugadores/[id]/page.tsx`

---

## Notas de arquitectura de datos (alineación vigente)

- Se mantiene el criterio oficial:
  - **Firestore**: datos estables de perfil y dominio.
  - **Realtime Database**: interacción de alta frecuencia (mensajes, notificaciones, follows/eventos).
- Las mejoras aplicadas en esta entrega son de capa UX y no cambian el contrato canónico de datos.

---

## Validación mínima recomendada post-entrega

1. Ir a `/jugadores`, aplicar filtros y usar `Guardar filtros actuales`.
2. Recargar la página y verificar persistencia de filtros guardados.
3. Escribir búsqueda, presionar Enter/salir de foco y confirmar aparición en `Búsquedas recientes`.
4. Entrar a un perfil de jugador desde móvil y verificar barra sticky inferior.

---

## Próxima iteración sugerida (pendiente)

- Comparador de perfiles (2-4 jugadores).
- Alertas guardadas de búsqueda (notificar nuevos perfiles que coincidan).
- Deep linking completo de estado de búsqueda/filtros por URL.
- Analítica de conversión por CTA (`view_profile -> follow -> contact`).

---

Estado del documento: **vigente**
