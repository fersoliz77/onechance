# 08 · Build Report — OneChance Platform

## Fecha
2026-04-30

## Estado final
✅ **Build, typecheck y lint en estado OK**

```
▲ Next.js 16.2.4 (Turbopack)
✓ Compiled successfully
✓ TypeScript: OK
✓ ESLint: OK
✓ 13 rutas generadas
```

---

## Rutas generadas

| Ruta | Tipo | Descripción |
|------|------|-------------|
| `/` | Static | Landing page |
| `/auth` | Static | Login + Registro 3 pasos |
| `/jugadores` | Static | Listado de jugadores con filtros |
| `/jugadores/[id]` | Dynamic | Perfil público de jugador |
| `/tecnicos` | Static | Listado de técnicos con filtros |
| `/tecnicos/[id]` | Dynamic | Perfil público de técnico |
| `/clubes` | Static | Listado de clubes con filtros |
| `/clubes/[id]` | Dynamic | Perfil público de club |
| `/representantes` | Static | Listado de representantes con filtros |
| `/representantes/[id]` | Dynamic | Perfil público de representante |
| `/dashboard` | Static | Panel privado del usuario |
| `/admin` | Static | Panel de administración |
| `/_not-found` | Static | 404 |

---

## Archivos creados / modificados

### Core
- `src/proxy.ts` — Reemplaza `middleware.ts` (deprecado en Next.js 16)
- `src/context/AuthContext.tsx` — Lectura de `systemRole` desde claims y fallback en `users/{uid}`
- `src/lib/permissions.ts` — Helper central de autorización (`isAdminRole`, `isSuperAdminRole`)
- `src/lib/firebase-admin.ts` — Inicialización server-side de Admin SDK

### API segura de administración
- `src/app/api/admin/profile-status/route.ts` — Cambio de estado de perfiles con validación de claim admin
- `src/app/api/admin/featured/route.ts` — Gestión de destacados con validación de claim admin
- `src/app/api/admin/video/route.ts` — Moderación/eliminación de videos con validación de claim admin
- `src/app/api/admin/system-role/route.ts` — Gestión de rol de sistema (solo super admin)
- `src/app/api/admin/_lib.ts` — Guardias `requireAdmin` / `requireSuperAdmin` + auditoría

### Páginas públicas
- `src/app/tecnicos/page.tsx` — Listado técnicos (accent azul #5A8FFF)
- `src/app/tecnicos/[id]/page.tsx` — Perfil técnico
- `src/app/clubes/page.tsx` — Listado clubes (accent amarillo #FFB400)
- `src/app/clubes/[id]/page.tsx` — Perfil club
- `src/app/representantes/page.tsx` — Listado representantes (accent púrpura #B464FF)
- `src/app/representantes/[id]/page.tsx` — Perfil representante

### Dashboard
- `src/app/dashboard/page.tsx` — Panel privado con tabs: Resumen / Editar / Videos
  - Edición inline para jugadores y técnicos
  - Edición inline para clubes y representantes
  - Gestión de videos con add/remove/toggle visibility
  - Envío a revisión desde borrador o rechazado

### Admin
- `src/app/admin/page.tsx` — Panel admin con tabs: Pendientes / Usuarios / Videos / Destacados + Plataforma (solo `super_admin`)
  - Aprobar / rechazar perfiles pendientes
  - Gestión de destacados
  - Moderar videos (toggle visible/oculto, eliminar)
  - Métricas de usuarios reales por rol desde `users`
  - Registro de auditoría de acciones admin

### Firebase Rules
- `firestore.rules` — Reglas de producción: 
  - Perfil público solo si `status == 'published'`
  - Owner con restricciones sobre campos sensibles (`status`, `isFeatured`, permisos)
  - Admin/Super Admin por custom claim (`request.auth.token.role`)
- `database.rules.json` — RTDB por claim de rol (`admin`/`super_admin`) en lugar de heurística por email

### Seed / Operaciones
- `web/scripts/seed.mjs` — Seed idempotente base para cuentas operativas y claims
- `web/package.json` — Script `npm run seed` + dependencia `firebase-admin`

### Documentación
- `docs/11_super_admin_audit_implementation_checklist.md` — checklist maestro actualizado con avances reales
- `docs/12_delivery_documentation_protocol.md` — protocolo de documentación continua

---

## Firebase Deploy
```
firebase deploy --only firestore:rules,database
✓ status: success
```

---

## Bugs corregidos
1. **`onAuthStateChanged` con 1 argumento** → corregido a `onAuthStateChanged(auth, cb)`
2. **`middleware.ts` deprecado en Next.js 16** → renombrado a `proxy.ts` con export `proxy()`
3. **Nav con botón "Mi perfil" duplicado** → limpiado, un solo botón
4. **Control admin por substring de email** → migrado a claims + `systemRole`
5. **Drift de estado en submit a revisión** → sincronización Firestore + RTDB

---

## Design System (resumen)
- Verde jugadores: `#00C853`
- Azul técnicos: `#5A8FFF`
- Amarillo clubes: `#FFB400`
- Púrpura representantes/femenino: `#B464FF`
- Fondo global: `#050A14`
- Font: DM Sans (400/500/600)
- Tailwind v4 con `@theme {}` en `globals.css`
