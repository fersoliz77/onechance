# OneChance — Estados de perfil y flujo de moderación

El campo `status` es el mecanismo central de control de visibilidad y ciclo de vida de todos los perfiles en la plataforma. Este documento describe los cinco estados posibles, cómo transicionan, y qué impacto real tienen en cada parte del sistema.

---

## Estados posibles

```typescript
type ProfileStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'hidden'
```

| Estado | Label visible | Color | Significado |
|--------|--------------|-------|-------------|
| `draft` | Borrador | Gris | Perfil creado pero no enviado a revisión |
| `pending` | Pendiente | Amarillo #FFB400 | Enviado por el usuario, esperando aprobación admin |
| `published` | Publicado | Verde #00C853 | Aprobado y visible públicamente |
| `rejected` | Rechazado | Rojo #FF3C3C | Rechazado por admin, con motivo de rechazo opcional |
| `hidden` | Oculto | Gris claro | Despublicado por admin, invisible pero conservado |

---

## Ciclo de vida normal

```
draft ──(usuario envía)──► pending ──(admin aprueba)──► published
                               │
                               └──(admin rechaza)──► rejected ──(usuario corrige y reenvía)──► pending
```

**Acciones admin adicionales desde cualquier estado:**

```
published ──(admin oculta)──► hidden
hidden    ──(admin publica)──► published
published ──(admin baja)──► draft | pending | rejected
```

---

## Estado inicial por rol

Al registrarse y crear perfil, el estado inicial depende del rol:

| Rol | Estado inicial | Condición especial |
|-----|---------------|-------------------|
| Jugador adulto | `draft` | — |
| Jugador menor de edad (`isMinor: true`) | `pending` | Va directo a revisión obligatoria sin acción del usuario |
| Técnico | `draft` | — |
| Club | `draft` | — |
| Representante | `draft` | — |

Código: `web/src/lib/auth.ts` → `createPlayerRecord()`, `createCoachRecord()`, etc.

---

## Persistencia de datos

El estado se guarda en **dos sistemas paralelos** y ambos se actualizan juntos:

1. **Firestore** (fuente de verdad): `players/{uid}/status`, `coaches/{uid}/status`, `clubs/{uid}/status`, `agents/{uid}/status`
2. **Realtime Database**: `profiles/{uid}/status` (para sincronización en tiempo real en el dashboard del usuario)

La actualización se hace vía `POST /api/admin/profile-status` (admin SDK, bypassa reglas de Firestore) o via cliente cuando el usuario envía su perfil a revisión (`submitForReview()` en `web/src/lib/rtdb.ts`).

---

## Impacto por área del sistema

### Listados públicos

Las páginas `/jugadores`, `/tecnicos`, `/clubes`, `/representantes` y la landing page usan queries que filtran exclusivamente por `status === 'published'`:

```typescript
// web/src/lib/firestore.ts
query(collection(db, 'players'), where('status', '==', 'published'))
```

**Efecto:** Un perfil que deja de estar en `published` desaparece inmediatamente de todos los listados públicos en el próximo reload de la página.

### Acceso directo al perfil (`/jugadores/[id]`, etc.)

Cada página de perfil público verifica acceso mediante `canViewProfile()`:

```typescript
// web/src/lib/publicProfileAccess.ts
function canViewProfile({ profileStatus, profileUid, viewerUid, viewerSystemRole }) {
  if (profileStatus === 'published') return true           // público
  if (viewerUid && viewerUid === profileUid) return true   // el dueño siempre puede verlo
  if (viewerSystemRole === 'admin' || viewerSystemRole === 'super_admin') return true
  return false
}
```

Si no pasa la verificación, la página muestra "Este perfil no está disponible públicamente".

### Dashboard del usuario

El usuario siempre puede ver su propio perfil independientemente del estado. El componente `StatusCard` (`web/src/features/dashboard/components/StatusCard.tsx`) muestra mensajes y acciones distintas según el estado actual:

| Estado | Mensaje al usuario | Acción disponible |
|--------|------------------|------------------|
| `draft` | "Tu perfil está listo para enviarse a revisión" | Botón "Enviar a revisión" (requiere ≥80% de completud) |
| `pending` | "Tu perfil está siendo revisado. Te notificaremos cuando sea aprobado." | Ninguna |
| `published` | "Tu perfil está publicado y visible en la plataforma." | Ninguna |
| `rejected` | "Tu perfil fue rechazado." + muestra `rejectionReason` | Botón "Reenviar a revisión" + puede editar |
| `hidden` | (sin mensaje especial) | Ninguna — requiere acción admin para reactivar |

### Panel admin — Pestaña Perfiles

El admin ve todos los perfiles sin filtro de estado. Puede:

- Ver contadores por estado (Publicados / Pendientes / Ocultos / Rechazados) en tiempo real
- Cambiar el estado de cualquier perfil mediante el dropdown en la columna Estado
- Usar el botón ojo (toggle rápido `published` ↔ `hidden`)
- Ver el perfil público (solo si está `published`)
- Editar datos directamente desde el drawer

### Panel admin — Pestaña Solicitudes

Muestra únicamente perfiles en estado `pending`. Es la cola de revisión principal. Desde ahí el admin puede aprobar (`published`) o rechazar (`rejected` + motivo).

### Exportación CSV

La exportación desde el panel de configuración admin solo incluye perfiles con `status === 'published'`. Los perfiles en otros estados no se exportan.

---

## Permisos: qué puede hacer el usuario según estado

| Estado | Usuario puede editar | Usuario puede enviar a revisión | Visible en listado público | Visible en perfil directo |
|--------|--------------------|---------------------------------|--------------------------|--------------------------|
| `draft` | Sí | Sí (si ≥80% completud) | No | Solo el dueño |
| `pending` | No | No (ya está en revisión) | No | Solo el dueño |
| `published` | No | No | Sí | Sí (todos) |
| `rejected` | Sí | Sí | No | Solo el dueño |
| `hidden` | No | No | No | Solo el dueño |

> **Nota:** El estado `hidden` es el único que el usuario no puede resolver por su cuenta. Queda bloqueado hasta que un admin lo reactive manualmente.

---

## Quién puede cambiar el estado

| Acción | Quién | Cómo |
|--------|-------|------|
| `draft` → `pending` | El propio usuario | Botón "Enviar a revisión" en dashboard |
| `pending` → `published` | Admin / Super Admin | Pestaña Solicitudes o dropdown en Perfiles |
| `pending` → `rejected` | Admin / Super Admin | Pestaña Solicitudes (con campo de motivo) |
| `published` → `hidden` | Admin / Super Admin | Dropdown en Perfiles |
| `published` → `draft` | Admin / Super Admin | Dropdown en Perfiles |
| `rejected` → `pending` | El propio usuario | Botón "Reenviar" en dashboard (luego de corregir) |
| Cualquier → cualquier | Admin / Super Admin | Dropdown en Pestaña Perfiles |

---

## API de cambio de estado

**Endpoint:** `POST /api/admin/profile-status`

Requiere `Authorization: Bearer <token>` de un usuario con `systemRole: 'admin'` o `'super_admin'` en Firestore.

```typescript
// Payload
{
  collection: 'players' | 'coaches' | 'clubs' | 'agents',
  uid: string,
  status: ProfileStatus,
  rejectionReason?: string  // solo requerido cuando status === 'rejected'
}
```

Lo que hace internamente:
1. Verifica auth admin
2. Actualiza Firestore (`set` con `merge: true`)
3. Actualiza RTDB (falla silenciosamente si no está configurado)
4. Registra en `admin_audit_logs` quién cambió qué y cuándo

Código: `web/src/app/api/admin/profile-status/route.ts`

---

## Registro de auditoría

Cada cambio de estado queda registrado en la colección `admin_audit_logs` de Firestore:

```
{
  actorUid: string,
  actorEmail: string,
  action: 'profiles.published' | 'profiles.draft' | 'profiles.hidden' | ...,
  targetCollection: 'players' | 'coaches' | ...,
  targetUid: string,
  createdAt: ISO timestamp
}
```

La actividad reciente se muestra en la pestaña Dashboard del panel admin.

---

*Última actualización: Mayo 2026*
