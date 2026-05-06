# OneChance — Plan de Implementación

> Generado a partir de la auditoría completa de código (2026-05-06).  
> Marcar cada ítem con `[x]` al completarlo. Las fases son secuenciales: completar la anterior antes de avanzar.

---

## FASE 1 — Quick Wins
_Tareas de bajo esfuerzo y alto impacto. No requieren cambios arquitectónicos._

### 1.1 UX básica

- [x] **Agregar botón de logout** en `Nav.tsx` — dropdown de usuario con nombre, "Mi panel" y "Cerrar sesión". Llamar a `logout()` de `lib/auth.ts` y redirigir a `/`.
- [x] **Agregar logout también en el dashboard** — botón en header o tab de Configuración como acción de cuenta.
- [ ] **Redirigir al dashboard tras registro exitoso** en `AuthModal.tsx` (landing). Actualmente el usuario queda en la landing sin feedback claro de que fue registrado.
- [x] **Mostrar nombre del usuario en Nav** cuando está logueado — reemplazar el botón "Ingresar" por el nombre + avatar inicial.

### 1.2 Validaciones del Dashboard

- [x] **Validar completud mínima antes de permitir "Enviar a revisión"** — no dejar enviar si `completionPct < 60` (o campos obligatorios vacíos). Mostrar qué falta completar.
- [ ] **Mensajes de error/validación en formularios de edición** — actualmente si `updateDoc` falla no hay feedback al usuario.

### 1.3 Corrección de datos

- [ ] **Unificar nomenclatura en registro de Club** — el formulario envía `fullName` y `nationality` pero `createClubRecord` los guarda como `name` y `country`. Alinear en `lib/auth.ts` y en los tipos de `types/index.ts` para que todo use la misma clave.
- [ ] **Eliminar `ageRange` calculado para técnicos** — en `lib/auth.ts` se asigna `ageRange: '18-22'` a coaches sin tener fecha de nacimiento. Remover ese campo o calcularlo correctamente.

### 1.4 Admin

- [x] **Reemplazar actividad en vivo fake del sidebar admin** — conectar `AdminSidebar` a datos reales de `adminAuditLog` de Firestore (últimas 5 acciones). Actualmente es un array hardcodeado.

---

## FASE 2 — Perfiles Públicos Incompletos
_Las rutas de técnico, club y representante existen pero no tienen contenido propio._

### 2.1 Perfil público de Técnico `/tecnicos/[id]`

- [x] **Crear diseño del perfil** — sección hero (nombre, foto, bandera, especialidad), tabs: Resumen / Trayectoria / Datos / Videos. Seguir el mismo patrón visual que el perfil de jugador pero con los campos de coach.
- [x] **Conectar a Firestore** — cargar datos reales desde colección `coaches/{id}`.
- [x] **Fallback data** — si no hay datos o el ID no existe mostrar `EmptyState` o redirigir a `/tecnicos`.
- [ ] **Agregar datos de carrera/trayectoria** al modelo de datos de coach en Firestore (si no existen: `career: { club, period, role }[]`).

### 2.2 Perfil público de Club `/clubes/[id]`

- [x] **Crear diseño del perfil** — hero con escudo/logo, nombre del club, país, división. Tabs: Info / Plantilla / Búsquedas activas.
- [x] **Conectar a Firestore** — cargar desde colección `clubs/{id}`.
- [x] **Sección "Búsquedas activas"** — campo en el modelo donde el club puede indicar qué posiciones está buscando (ej. "Buscamos delantero y lateral derecho para la temporada 2026").
- [x] **Fallback** — `EmptyState` si ID no existe.

### 2.3 Perfil público de Representante `/representantes/[id]`

- [x] **Crear diseño del perfil** — hero con foto, nombre, agencia, países donde opera. Tabs: Info / Jugadores representados.
- [x] **Conectar a Firestore** — cargar desde colección `agents/{id}`.
- [ ] **Sección "Jugadores representados"** — listar jugadores del agente (si el agente vinculó jugadores a su perfil).
- [x] **Fallback** — `EmptyState` si ID no existe.

### 2.4 Cleanup de datos hardcodeados en perfil de Jugador

- [x] **Eliminar presets hardcodeados** (`seed_player_1/2/3`) de `/app/jugadores/[id]/page.tsx` — todos los jugadores deben cargar sus datos desde Firestore sin distinción.
- [x] **Revisar `fallbackPlayers`** — si los jugadores seed fueron creados en Firestore con esos IDs, los datos deben vivir ahí y no en el código. Migrar o eliminar el fallback.
- [x] **Unificar experiencia de perfil** — la galería, estadísticas y secciones enriquecidas deben mostrarse para todos (con placeholders cuando faltan datos), no solo para los 3 seeds.

---

## FASE 3 — Dashboard: Completar Funcionalidades Incompletas

### 3.1 Upload de fotos

- [x] **Configurar Firebase Storage** en el proyecto — crear bucket, reglas de acceso (solo owner puede subir, lectura pública).
- [x] **Componente de upload** — drag-and-drop o click para seleccionar imagen, preview antes de confirmar, progress bar durante upload.
- [x] **Integración en tab "Fotos" del dashboard** — reemplazar los placeholders actuales con el componente funcional. Máximo 10 fotos por perfil.
- [x] **Guardar URLs en RTDB** — `photos/{uid}/{photoId}` con url, storagePath y createdAt.
- [ ] **Mostrar fotos en el perfil público** — en el tab "Fotos" del perfil de jugador/técnico.
- [x] **Validar tamaño y tipo de archivo** — máximo 5MB, solo jpg/png/webp.

### 3.2 Configuración de cuenta

- [x] **Toggle de visibilidad de contacto** — guardar en RTDB `profiles/{uid}/visibility`. Si está desactivado, ocultar el botón "Contactar" en el perfil público.
- [x] **Toggle de notificaciones por email** — guardar en RTDB `profiles/{uid}/visibility.emailNotifications`. (La lógica de envío de emails se conecta más adelante.)
- [ ] **Cambiar contraseña** — formulario con contraseña actual + nueva + confirmación. Usar `updatePassword` de Firebase Auth.
- [ ] **Eliminar cuenta** — acción destructiva con modal de confirmación. Borra el registro de Firestore + RTDB + Auth.

### 3.3 Videos para otros roles

- [ ] **Decidir si técnicos y representantes pueden subir videos** — si sí, habilitar el tab "Videos" para esos roles también. Si no, documentarlo explícitamente como limitación de producto en `docs/06_features.md`.

### 3.4 Completud del perfil

- [x] **Calcular `completionPct` dinámicamente** en el dashboard — en lugar de un valor estático inicial, calcularlo en base a cuántos campos están completados. Actualizar en RTDB cuando el usuario edita.
- [x] **Mostrar qué falta completar** — lista de campos vacíos con links directos al campo correspondiente en el formulario de edición.

---

## FASE 4 — Constantes y Tipos: Eliminar Duplicación

_Bajo esfuerzo, alto impacto en mantenibilidad. Hacer antes de la fase de arquitectura._

- [x] **Crear `web/src/lib/constants.ts`** con:
  ```typescript
  ROLES = { player, coach, club, agent }
  ROLE_LABELS = { player: 'Jugador', coach: 'Técnico', club: 'Club', agent: 'Representante' }
  ROLE_COLORS = { player: '#00C853', coach: '#5A8FFF', club: '#FFB400', agent: '#B464FF' }
  ROLE_TONES = { player: 'green', coach: 'blue', club: 'yellow', agent: 'purple' }
  PROFILE_STATUSES y sus labels, colores e íconos
  ```
- [x] **Reemplazar todos los mapeos duplicados** en `dashboard/page.tsx`, `admin/page.tsx`, `AuthContext.tsx`, y componentes de features por imports desde `constants.ts`.
- [x] **Tipar custom claims de Firebase** — crear interfaz `FirebaseClaims { role?: 'admin' | 'super_admin' }` y usarla en `AuthContext.tsx` donde se hace `token.claims.role`.
- [x] **Reemplazar `DocumentData` en `PendingItem`** por un tipo específico `PendingProfile` con todas las propiedades que se usan del objeto.
- [ ] **Tipar `VideoEntry` completamente** — asegurar que `playerUid` esté en la interfaz y no se agregue dinámicamente.

---

## FASE 5 — Arquitectura: Escalabilidad

_Estas mejoras son necesarias cuando la plataforma tenga más de ~200 perfiles por rol._

### 5.1 Migrar filtrado/búsqueda al backend

- [ ] **Crear route handlers de búsqueda** — `GET /api/players?search=&position=&nationality=&gender=&ageRange=&foot=` que construya Firestore queries y devuelva paginado.
- [ ] **Repetir para coaches, clubs y agents** — `GET /api/coaches`, `GET /api/clubs`, `GET /api/agents` con sus filtros específicos.
- [ ] **Migrar hooks de listado** (`usePlayersListing`, etc.) para hacer `fetch` a las API routes en lugar de `getPublishedPlayers()` directamente.
- [ ] **Implementar paginación** — cursor-based con el campo `startAfter` de Firestore. Agregar botón "Cargar más" o scroll infinito en las páginas de listado.

### 5.2 Server Components para listados

- [ ] **Convertir páginas de listado a Server Components** — `jugadores/page.tsx`, `tecnicos/page.tsx`, `clubes/page.tsx`, `representantes/page.tsx` hacen el fetch inicial en servidor y pasan los datos a un Client Component solo para los filtros interactivos.
- [ ] **Separar `*ListClient.tsx`** — componente de cliente que recibe `initialData` y maneja filtros/búsqueda en cliente (para resultados rápidos) o llama a la API.

### 5.3 Capa de API routes para el dashboard

- [ ] **Crear `GET /api/profiles/[uid]`** que retorne perfil completo + estado del perfil. El dashboard lo consume con `fetch` o SWR en lugar de llamar a Firestore directamente.
- [x] **Crear `PUT /api/profiles/[uid]`** para editar perfil — valida que el token pertenezca al mismo `uid`, luego actualiza Firestore.
- [x] **Agregar validación de pertenencia** — si `token.uid !== params.uid` retornar 403. Actualmente cualquier usuario autenticado podría editar el perfil de otro.

### 5.4 Caché de datos en cliente

- [ ] **Instalar SWR o TanStack Query** — `npm install swr`.
- [ ] **Reemplazar los `useEffect + useState` de fetch** en dashboard y listados por hooks de SWR con caché y revalidación.

---

## FASE 6 — Seguridad

- [ ] **Rate limiting en API routes de admin** — actualmente solo existe en cliente. Agregar un check en `_lib.ts` que limite a N acciones por minuto por UID usando RTDB o KV store.
- [x] **Validar schema de inputs en rutas API** — usar Zod para validar el body de los requests en todas las rutas `/api/admin/*`. Rechazar requests con campos inesperados.
- [ ] **Migrar detección de admin de email a custom claims** — actualmente si el email contiene 'admin' puede haber acceso indeseado. Remover esa condición y depender 100% del custom claim `role`.
- [ ] **Revisar Firestore Security Rules** — verificar que un usuario no pueda leer el perfil de otro usuario en estado `draft` o `pending` (solo `published` es público, solo el owner puede ver el suyo).
- [ ] **Agregar `Content-Security-Policy` header** en `next.config.js` para proteger contra XSS.
- [ ] **Revisar que no haya secrets en el repo** — auditar `.env*` files y el historial de git. Asegurarse que las claves de Firebase Admin solo estén en variables de entorno del servidor.

---

## FASE 7 — Features Nuevas

_Solo arrancar estas cuando las fases anteriores estén completadas._

### 7.1 Sistema de contacto

- [x] **Botón "Contactar"** en perfiles públicos ya existe pero no tiene función. Implementar como: al hacer clic (usuario logueado), abre un modal para enviar un mensaje que queda guardado en RTDB `messages/{uid}`.
- [ ] **Inbox en el dashboard** — tab "Mensajes" con conversaciones recibidas.
- [ ] **Notificación por email** cuando se recibe un contacto (Firebase Extensions: Trigger Email).

### 7.2 Búsquedas activas de clubes

- [ ] **Modelo de datos**: `clubs/{id}/openings[]` — posición buscada, descripción, fecha límite.
- [ ] **UI en dashboard del club** — formulario para crear/editar búsquedas activas.
- [ ] **Mostrar en perfil público del club** — sección "Búsqueda de jugadores" visible para todos.
- [ ] **Notificación a jugadores** de la posición correcta (nice to have).

### 7.3 Perfiles destacados / Suscripciones

- [ ] **Definir tiers de plan** — Free vs Pro. Documentar en `docs/06_features.md`.
- [ ] **Integrar MercadoPago o Stripe** para cobros en LATAM.
- [ ] **Lógica de perfil destacado** — jugadores/técnicos Pro aparecen primero en listados y tienen badge especial.
- [ ] **Tab "Suscripciones" en admin** — ver quién paga, fecha de vencimiento, cancelar.

### 7.4 Notificaciones in-app

- [x] **Modelo `notifications/{uid}/{notifId}`** en RTDB.
- [x] **Tipos de notificaciones**: perfil aprobado, perfil rechazado, mensaje recibido, perfil visto por un scout.
- [x] **Indicador de notificaciones en Nav** — badge con contador de no leídas, dropdown con últimas 10.
- [ ] **Página `/notificaciones`** — lista completa con paginación.

### 7.5 Verificación de identidad

- [ ] **Badge "Verificado"** para jugadores, técnicos y clubes que hayan pasado verificación manual.
- [ ] **Flujo de solicitud de verificación** — subir documento de identidad o credencial. Admin lo revisa y aprueba.
- [ ] **Almacenar documento encriptado** o solo el resultado de la verificación (no el documento).

---

## FASE 8 — Calidad y CI/CD

- [x] **Configurar GitHub Actions** — workflow `.github/workflows/web-ci.yml` que corra `npm run lint`, `npm run typecheck` y `npm run build` en cada push/PR que afecte `web/**`.
- [ ] **Agregar test unitarios para `lib/`** — especialmente `auth.ts`, `firestore.ts`, `permissions.ts`. Usar Vitest o Jest.
- [ ] **Agregar tests de integración para rutas API críticas** — `/api/admin/profile-status`, `/api/admin/system-role`.
- [ ] **Configurar Husky + lint-staged** — lint automático antes de cada commit.
- [ ] **Agregar Playwright o Cypress** para tests E2E de flujos críticos: registro, login, envío a revisión, aprobación admin.
- [ ] **Bundle analyzer** — `@next/bundle-analyzer` para detectar dependencias pesadas.
- [ ] **Configurar Sentry** para captura de errores en producción.

---

## Registro de progreso

| Fase | Descripción | Estado |
|---|---|---|
| Fase 1 | Quick Wins | 🟡 Parcial (5/8) |
| Fase 2 | Perfiles públicos incompletos | 🟡 Parcial (10/12) |
| Fase 3 | Dashboard — funcionalidades incompletas | 🟡 Parcial (8/12) |
| Fase 4 | Constantes y tipos | 🟡 Parcial (4/5) |
| Fase 5 | Arquitectura y escalabilidad | 🟡 Parcial (2/8) |
| Fase 6 | Seguridad | 🟡 Parcial (1/6) |
| Fase 7 | Features nuevas | 🟡 Parcial (7/14) |
| Fase 8 | Calidad y CI/CD | 🟡 Parcial (1/7) |

---

_Última actualización: 2026-05-06_
