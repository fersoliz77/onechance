# OneChance — Security and Operations Runbook

## Fuente de verdad de estado de perfil

- Fuente principal: `Firestore` (`players|coaches|clubs|agents.status`).
- Fuente secundaria sincronizada: `RTDB` (`profiles/{uid}.status`) para estado operativo de dashboard.
- Regla operativa: todo cambio de estado debe impactar ambas fuentes en la misma operación lógica.

## Proceso de permisos administrativos

1. Solo `super_admin` puede promover/degradar roles administrativos.
2. Toda modificación de rol pasa por endpoint seguro server-side.
3. Cada cambio queda auditado en `admin_audit_logs`.

## Procedimiento de rollback de permisos (emergencia)

1. Identificar `uid` y rol objetivo.
2. Ejecutar cambio a `systemRole='user'` por endpoint `/api/admin/system-role`.
3. Invalidar sesión del usuario afectado (forzar refresh de token).
4. Verificar en Firestore `users/{uid}.systemRole` y en claims.
5. Confirmar evento en `admin_audit_logs`.

## Validación de seguridad (escenarios)

- Owner intenta cambiar `status` de su perfil por cliente directo -> denegado por reglas.
- Owner intenta marcar `isFeatured=true` -> denegado por reglas.
- Usuario sin claim admin invoca `/api/admin/*` -> `403 Forbidden`.
- Admin no superadmin intenta `system-role` -> `403 Forbidden`.
- Super admin ejecuta cambio de rol -> permitido y auditado.

## Criterios de QA de roles

- `user`: no accede a `/admin` ni puede ejecutar acciones admin.
- `admin`: opera moderación (perfiles/videos/destacados) sin acceso a gobernanza global.
- `super_admin`: acceso completo, incluyendo gestión de roles y configuración de plataforma.
