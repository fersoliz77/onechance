# OneChance — Protocolo de documentación continua

## Objetivo

Garantizar que cada cambio funcional, técnico o de seguridad quede documentado de forma trazable.

## Regla operativa

- Todo cambio implementado debe dejar evidencia documental en el mismo ciclo de trabajo.
- No se considera una tarea "terminada" si no se actualizó su documentación asociada.

## Qué se documenta siempre

- Decisiones de arquitectura y seguridad.
- Cambios de permisos, roles y reglas.
- Flujos de datos (lectura/escritura) afectados.
- Nuevas pantallas, modales o cambios de UX relevantes.
- Scripts operativos (seed, migraciones, utilidades de admin).
- Riesgos detectados y mitigaciones aplicadas.

## Dónde se documenta

- Plan y seguimiento: `docs/11_super_admin_audit_implementation_checklist.md`
- Arquitectura y profesionalización: `docs/10_repo_professionalization_plan.md`
- Modelo de datos: `docs/05_data_model.md`
- Features y comportamiento: `docs/06_features.md`
- Reporte técnico de ejecución: `docs/08_build_report.md`

## Checklist mínimo por cada entrega

- [ ] Qué se cambió.
- [ ] Por qué se cambió.
- [ ] Archivos impactados.
- [ ] Riesgos / impacto.
- [ ] Estado de pruebas o validación.
- [ ] Próximos pasos.

## Convención de estado

- `[ ]` pendiente
- `[x]` completado
- Fecha y responsable al final de cada actualización relevante.

## Compromiso del proyecto

Se adopta este protocolo como estándar del repo para mantener trazabilidad y facilitar auditorías futuras.
