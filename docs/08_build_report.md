# 08 · Build Report — OneChance Platform

## Fecha
2026-04-30

## Estado final
✅ **Build exitoso — 0 errores, 0 warnings**

```
▲ Next.js 16.2.4 (Turbopack)
✓ Compiled successfully
✓ TypeScript: OK
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
- `src/context/AuthContext.tsx` — Fix: `onAuthStateChanged(auth, cb)` con 2 args

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
  - Gestión de videos con add/remove/toggle visibility
  - Envío a revisión desde borrador o rechazado

### Admin
- `src/app/admin/page.tsx` — Panel admin con tabs: Pendientes / Jugadores / Videos
  - Aprobar / rechazar perfiles pendientes
  - Publicar / ocultar / destacar jugadores
  - Moderar videos (toggle visible/oculto, eliminar)

### Firebase Rules
- `firestore.rules` — Reglas de producción: 
  - Perfil público solo si `status == 'published'`
  - Owner puede leer/escribir su propio doc
  - Admin (email contiene 'admin') puede leer/escribir todo
- `database.rules.json` — RTDB: profiles/videos/photos solo autenticados, admin puede todo

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

---

## Design System (resumen)
- Verde jugadores: `#00C853`
- Azul técnicos: `#5A8FFF`
- Amarillo clubes: `#FFB400`
- Púrpura representantes/femenino: `#B464FF`
- Fondo global: `#050A14`
- Font: DM Sans (400/500/600)
- Tailwind v4 con `@theme {}` en `globals.css`
