# OneChance — Checklist de implementación (Super Admin + Auditoría profunda)

> Documento de control para ejecutar el plan acordado.
> Se irá marcando cada item con `[x]` al completarlo.

## Objetivo

Elevar la plataforma a un estado seguro y operable en producción con:

- Rol `super_admin` con control total real.
- Roles administrativos con permisos granulares.
- Flujos de datos consistentes entre Firestore y RTDB.
- Datos reales de muestra (5 por rol) y cuentas de prueba.
- Consistencia funcional y visual en toda la web.

---

## Fase 0 — Preparación y definición

- [x] Confirmar matriz de permisos por rol (`super_admin`, `admin`, `player`, `coach`, `club`, `agent`).
- [x] Definir alcance de "control total" para `super_admin` (acciones y módulos exactos).
- [x] Definir criterios de aceptación por fase.
- [x] Definir naming y estructura final de documentos de usuario (`users/{uid}`).

### Matriz de permisos congelada (v1)

- `super_admin` (control total)
  - Todo lo de `admin`.
  - Gestionar admins (`create`, `update`, `disable`).
  - Acceder y modificar configuración global de plataforma.
  - Ejecutar seeds/importaciones operativas críticas.
  - Ver auditoría administrativa completa.

- `admin` (operativo)
  - Aprobar/rechazar/publicar/ocultar perfiles.
  - Moderar videos/fotos (ocultar/eliminar).
  - Gestionar destacados.
  - Ver métricas/listados administrativos.
  - Sin gestión de admins ni configuración global crítica.

- `player` / `coach` / `club` / `agent`
  - Leer/editar su propio perfil.
  - Enviar perfil a revisión.
  - Gestionar recursos propios (videos/fotos/settings personales).
  - Leer contenido público publicado.

### Acciones por permiso (v1)

- `profiles.approve|reject|publish|hide` -> `admin`, `super_admin`
- `profiles.delete` -> `super_admin` (recomendado)
- `content.video.moderate` -> `admin`, `super_admin`
- `content.video.delete_hard` -> `super_admin` (recomendado)
- `featured.set` -> `admin`, `super_admin`
- `admin.users.read` -> `admin`, `super_admin`
- `admin.manage_admins` -> `super_admin`
- `platform.settings.write` -> `super_admin`
- `audit.read.full` -> `super_admin`

---

## Fase 1 — Seguridad crítica (bloqueante)

### 1.1 Modelo de autorización

- [x] Eliminar toda dependencia de `email.includes('admin')` en frontend.
- [x] Eliminar toda dependencia de `auth.token.email.contains('admin')` en reglas.
- [x] Implementar autorización por custom claims (`role`, `permissions`).
- [x] Definir fallback seguro para usuarios sin claims (deny by default).

### 1.2 Reglas Firebase endurecidas

- [x] Endurecer `web/firestore.rules` para separar lectura/escritura por rol.
- [x] Restringir campos sensibles (`status`, `isFeatured`, flags admin) para owners.
- [x] Endurecer `web/database.rules.json` con permisos por claim.
- [x] Validar reglas con escenarios de ataque comunes (owner intentando auto-publicarse, etc.).

### 1.3 Protección de rutas y acciones sensibles

- [x] Implementar protección robusta para `/admin` y subrutas.
- [x] Definir capa server para operaciones críticas de moderación.
- [x] Bloquear ejecución de acciones admin desde cliente no autorizado.

### 1.4 Auditoría de acciones admin

- [x] Crear registro de auditoría para acciones críticas (`approve`, `reject`, `hide`, `feature`, `delete`).
- [x] Guardar actor, timestamp, recurso, estado anterior y estado nuevo.
- [x] Mostrar historial básico en panel admin (o endpoint interno para revisión).

---

## Fase 2 — Consistencia de flujos de datos

### 2.1 Estado de perfil consistente

- [x] Corregir flujo "Enviar a revisión" para actualizar Firestore y RTDB de forma consistente.
- [x] Definir fuente de verdad principal para `status` (documentar decisión).
- [x] Garantizar que admin y dashboard consuman el mismo estado efectivo.

### 2.2 Mapa de lectura/escritura por pantalla

- [x] Validar `/auth` (creación de usuario + perfil + estado inicial).
- [x] Validar listados públicos por rol (`published` solamente).
- [x] Validar detalle público por rol con reglas correctas.
- [x] Validar `/dashboard` (lectura, edición, submit, videos, settings).
- [x] Validar `/admin` (pendientes, usuarios, videos, destacados).
- [x] Revisar cada modal y confirmar que lee/escribe en la fuente correcta.

### 2.3 Errores y estados de interfaz

- [x] Agregar manejo de errores consistente en lecturas y escrituras críticas.
- [x] Estandarizar mensajes de error/empty/loading.
- [x] Agregar retry o recuperación en operaciones sensibles.

---

## Fase 3 — Super Admin y panel de configuración

### 3.1 Rol y permisos

- [x] Agregar `super_admin` al modelo de identidad de plataforma.
- [x] Definir permisos mínimos del rol `admin` (operativo, no total).
- [x] Definir permisos completos del rol `super_admin` (control total).

### 3.2 Panel de configuración de plataforma

- [x] Crear sección de configuración accesible solo por `super_admin`.
- [x] Incluir controles de parámetros globales de la plataforma.
- [x] Incluir gestión de admins (alta/baja/cambio de permiso) solo para `super_admin`.

### 3.3 Gobernanza

- [x] Documentar proceso para otorgar/revocar permisos administrativos.
- [x] Documentar procedimiento de emergencia (rollback de permisos).

---

## Fase 4 — Datos reales, cuentas y seed

### 4.1 Dataset

- [x] Confirmar fuente de datos reales (o anonimizados con base legal).
- [x] Preparar 5 perfiles reales por rol: `players`, `coaches`, `clubs`, `agents`.
- [x] Validar consistencia cruzada de datos (club actual, mercados, trayectoria, etc.).

### 4.2 Cuentas de prueba y administración

- [x] Crear cuenta `super_admin`.
- [x] Crear al menos 2 cuentas `admin` operativas.
- [x] Crear 1 cuenta demo por rol de negocio (`player`, `coach`, `club`, `agent`).

### 4.3 Script de seed

- [x] Implementar script idempotente de seed (Auth + Firestore + RTDB + claims).
- [x] Versionar seed (`seedVersion`) y evitar duplicados.
- [x] Generar reporte final de seed (`uid`, `email`, `role`, `claims`).

---

## Fase 5 — Consistencia UI/UX y calidad

### 5.1 Consistencia visual y de interacción

- [x] Unificar patrón de filtros entre listados (sidebar vs inline según criterio definido).
- [x] Corregir inconsistencias de copy, ortografía y acentos en toda la app.
- [x] Normalizar estados vacíos y jerarquías visuales.

### 5.2 Cobertura funcional

- [x] Completar edición de perfil para `club` y `agent` en dashboard.
- [x] Validar flujos end-to-end por cada rol.

### 5.3 Mantenibilidad

- [x] Reducir duplicación en vistas de detalle por rol.
- [x] Consolidar patrones reutilizables para cards, hero, stats y secciones.

---

## Checklist de validación final (Go-Live)

- [x] Usuario sin permisos no puede entrar ni ejecutar acciones admin.
- [x] `admin` operativo funciona con límites correctos.
- [x] `super_admin` puede operar en todos los módulos y configuración global.
- [x] Flujos de estado no presentan drift entre Firestore y RTDB.
- [x] Listados y detalles muestran datos reales (5 por rol mínimo).
- [x] Logs de auditoría registran acciones críticas administrativas.
- [x] QA de regresión completado en desktop y mobile.

---

## Registro de avance

- Estado actual: `Checklist completado`
- Última actualización: `2026-04-30`
- Responsable: `Equipo OneChance`

## Avance implementado (2026-04-30)

- [x] Migración inicial de checks admin en frontend a `systemRole` (`admin`/`super_admin`).
- [x] Reglas Firestore y RTDB migradas de heurística por email a claims por rol.
- [x] Restricción inicial de campos sensibles para owners en Firestore rules.
- [x] Sincronización de submit a revisión en dashboard (Firestore + RTDB).
- [x] Tab de configuración de plataforma visible solo para `super_admin` en panel admin.
- [x] Script base de seed (`web/scripts/seed.mjs`) con claims, usuarios y reporte.
- [x] Protocolo de documentación continua agregado (`docs/12_delivery_documentation_protocol.md`).
- [x] Alta y verificación end-to-end de `super_admin` (`fer@soliz.com`) en Auth + Firestore + RTDB.

## QA ejecutado (2026-04-30)

- [x] `super_admin` puede leer documentos `users/*` de terceros (Firestore: 200).
- [x] `admin` puede leer documentos `users/*` de terceros (Firestore: 200).
- [x] usuario estándar puede leer solo su documento propio `users/{uid}` (Firestore: 200).
- [x] usuario estándar no puede leer `users/{uid}` de terceros (Firestore: 403).
- [x] usuario estándar puede leer `userRoles/{uid}` propio (RTDB: 200).
- [x] usuario estándar no puede leer `userRoles/{uid}` de terceros (RTDB: denegado).
- [x] `admin` y `super_admin` pueden leer `userRoles/{uid}` de terceros (RTDB: 200).
