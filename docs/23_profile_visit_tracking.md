# Sistema de tracking de visitas a perfiles

> Implementado: 2026-05-25
> Estado: en producción

---

## Concepto

Cada vez que un usuario abre el perfil público de otro usuario, se registra una visita.
El sistema diferencia visitas internas (usuario autenticado) de externas (anónimas).
Las visitas propias (usuario ve su propio perfil) se ignoran silenciosamente.

---

## Flujo del cliente

```
Usuario abre /jugadores/[id]  (o /tecnicos, /clubes, /representantes)
          │
          ▼
  registerProfileVisit(profileUid, user?.uid)     ← lib/profileViews.ts
          │
          ├─ ¿viewer === profileUid?  → salir (no contabilizar visita propia)
          ├─ ¿sessionStorage tiene 'oc_profile_visit:{uid}'?  → salir (ya registrado esta sesión)
          │
          ▼
  POST /api/profile-visit  { profileUid }
          │
          ├─ sin token  → visita externa (anónima)
          └─ con token  → visita interna (autenticada)
```

**Deduplicación por sesión:** el helper setea `sessionStorage['oc_profile_visit:{uid}'] = '1'`
al primer registro exitoso. Navegar al mismo perfil en la misma sesión no genera visitas repetidas.
Abrir el perfil en una nueva pestaña o después de cerrar el browser sí cuenta.

---

## API routes

### `POST /api/profile-visit`

No requiere autenticación. El token Bearer es opcional — si está presente y es válido,
la visita se clasifica como interna.

**Protección anti self-visit:** si el token decodificado tiene el mismo `uid` que `profileUid`,
el servidor retorna `ok: true` pero no escribe nada.

Writes en RTDB (con transacciones para concurrencia):

| Path | Qué actualiza |
|---|---|
| `profileMetrics/{uid}` | `visits +1`, `visitsInternal/External +1`, `lastVisitedAt` |
| `profileVisitsDaily/{YYYY-MM-DD}/{uid}` | `total/internal/external +1`, `updatedAt` |
| `profileVisitors/{uid}/{viewerUid}` | `count +1`, `lastVisitedAt`, datos del viewer (solo si auth) |

### `GET /api/admin/profile-visits-summary`

Requiere admin. Retorna todos los `profileMetrics` como array:

```ts
[{ uid, visits, visitsInternal, visitsExternal, lastVisitedAt }]
```

### `POST /api/admin/profile-visitors`

Requiere admin. Body: `{ profileUid }`.
Retorna visitantes autenticados de ese perfil, ordenados por `count` desc:

```ts
[{ uid, name, email, role, systemRole, count, lastVisitedAt }]
```

### `GET /api/admin/profile-visits-top7d?days=7|14|30`

Requiere admin. Agrega los paths `profileVisitsDaily/{key}/{uid}` de los últimos N días
y retorna el top 10 de perfiles más visitados:

```ts
{ items: [{ uid, total, internal, external }], days: 7 }
```

---

## Paths RTDB

| Path | Contenido | Quién escribe | Quién lee |
|---|---|---|---|
| `profileMetrics/{uid}` | Totales acumulados | Admin SDK (`/api/profile-visit`) | Cualquier usuario auth (client SDK) |
| `profileVisitsDaily/{YYYY-MM-DD}/{uid}` | Breakdown diario | Admin SDK | Solo Admin SDK (vía API routes admin) |
| `profileVisitors/{uid}/{viewerUid}` | Quién visitó y cuántas veces | Admin SDK | Solo Admin SDK (vía API routes admin) |

---

## Funciones del cliente

En `web/src/lib/profileViews.ts`:

```ts
registerProfileVisit(profileUid: string, viewerUid?: string): void
// Llama a POST /api/profile-visit con o sin token.
// No-op si es visita propia, si ya fue registrada en esta sesión, o si corre en SSR.
```

En `web/src/lib/rtdb.ts`:

```ts
subscribeProfileVisits(uid: string, cb: (visits: number) => void): () => void
// onValue sobre profileMetrics/{uid}/visits — tiempo real.
// Retorna unsubscribe.
```

---

## Integración en páginas de perfil

Los cuatro tipos de perfil llaman `registerProfileVisit` en un `useEffect`:

```ts
// web/src/app/jugadores/[id]/page.tsx (también tecnicos, clubes, representantes)
useEffect(() => {
  registerProfileVisit(id, user?.uid)
}, [id, user?.uid])
```

El conteo en tiempo real se puede suscribir con `subscribeProfileVisits` para mostrarlo
en el perfil propio o en el panel de admin.

---

## Reglas de seguridad RTDB

```json
"profileMetrics": {
  "$uid": {
    ".read": "auth != null",
    ".write": false
  }
}
```

El cliente puede leer sus propias métricas (y las de otros perfiles para mostrar el contador).
La escritura es exclusiva del Admin SDK.

`profileVisitsDaily` y `profileVisitors` no tienen reglas de lectura pública —
solo el Admin SDK los lee (vía API routes de admin).
