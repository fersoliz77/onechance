# OneChance — Security and Operations Runbook

## Fuente de verdad de estado de perfil

- Fuente principal: `Firestore` (`players|coaches|clubs|agents.status`).
- Fuente secundaria sincronizada: `RTDB` (`profiles/{uid}.status`) para estado operativo de dashboard.
- Regla operativa: todo cambio de estado debe impactar ambas fuentes en la misma operación lógica.

## Proceso de permisos administrativos

1. Solo `super_admin` puede promover/degradar roles administrativos.
2. Toda modificación de rol pasa por endpoint seguro server-side.
3. Cada cambio queda auditado en `admin_audit_logs`.

## Fuente de verdad de roles

- `role` (tipo de cuenta de producto): se guarda en `Firestore users/{uid}.role`.
  - Valores: `player | coach | club | agent`.
- `systemRole` (nivel administrativo): se guarda en dos lugares.
  - Primario app/API: `Firestore users/{uid}.systemRole`.
  - Espejo para reglas RTDB: `Realtime Database userRoles/{uid}/systemRole`.
  - Valores: `user | admin | super_admin`.

## Modelo mental rapido (evita confusiones)

- `systemRole='user'` no es un perfil futbolistico; significa "sin permisos admin".
- Los perfiles futbolisticos son siempre `role` (`player|coach|club|agent`).
- Un mismo usuario puede ser, por ejemplo, `role='agent'` y `systemRole='super_admin'`.
- Si hay que mostrar un unico rol en UI interna, priorizar `systemRole`.

## Diferencia operativa entre admin y super_admin

- `admin`
  - Puede moderar perfiles, destacados y videos.
  - Puede leer datos administrativos necesarios para operación.
  - No puede gestionar roles administrativos.
- `super_admin`
  - Incluye todo lo de `admin`.
  - Puede cambiar `systemRole` de usuarios (`/api/admin/system-role`).
  - Puede ejecutar gobernanza de acceso y configuración global.

## Estado actual del proyecto (2026-05-06)

- Reglas desplegadas activas en `onechance-platform`:
  - `web/firestore.rules`
  - `web/database.rules.json`
- Se eliminó bootstrap por email hardcodeado para super admin.
- Política vigente:
  - El owner solo puede auto-crearse como `systemRole='user'`.
  - Solo `super_admin` puede promover/degradar roles.

## Cómo promover manualmente un super_admin

1. Identificar `uid` del usuario en Firebase Auth.
2. En Firestore setear `users/{uid}.systemRole = 'super_admin'`.
3. En RTDB setear `userRoles/{uid}/systemRole = 'super_admin'`.
4. Cerrar sesión y volver a iniciar para refrescar permisos en cliente.
5. Verificar acceso al tab de gobernanza en `/admin`.

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

- `user`: no accede a `/admin` ni puede ejecutar acciones admin; puede ser player/coach/club/agent.
- `admin`: opera moderación (perfiles/videos/destacados) sin acceso a gobernanza global.
- `super_admin`: acceso completo, incluyendo gestión de roles y configuración de plataforma.

## Comportamiento de UI recomendado para el menu de cuenta

- Si `systemRole` es `admin` o `super_admin`, mostrar ese rol en el label principal.
- Si `systemRole` es `user`, mostrar `role` (Jugador/Tecnico/Club/Representante).
