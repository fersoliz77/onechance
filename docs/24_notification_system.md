# Sistema de notificaciones

> Implementado: 2026-05-25
> Estado: en producción

---

## Concepto

Notificaciones en tiempo real entregadas al usuario autenticado. Aparecen como un badge
en el ícono de campana en la Nav. Al abrir el panel, todas se marcan como leídas.

---

## Tipos de notificación

```ts
type: 'profile_approved' | 'profile_rejected' | 'contact_received' | 'profile_viewed' | 'message_received'
```

| Tipo | Cuándo se dispara | Quién lo dispara |
|---|---|---|
| `message_received` | Al entregar un mensaje aprobado al destinatario | `POST /api/messages/send` (directo) y `POST /api/admin/messages/[id]/approve` |
| `profile_approved` | — (tipo definido, no implementado aún) | pendiente |
| `profile_rejected` | — (tipo definido, no implementado aún) | pendiente |
| `contact_received` | — (tipo definido, no implementado aún) | pendiente |
| `profile_viewed` | — (tipo definido, no implementado aún) | pendiente |

> Los tipos `profile_approved`, `profile_rejected`, etc. están en el enum del tipo
> `NotificationEntry` como preparación, pero el API route de moderación de perfiles
> (`/api/admin/profile-status`) todavía no dispara notificaciones al usuario afectado.

---

## Estructura RTDB

Path: `notifications/{uid}/{notifId}`

```ts
interface NotificationEntry {
  id:        string    // clave RTDB (generada con push())
  type:      'profile_approved' | 'profile_rejected' | 'contact_received' | 'profile_viewed' | 'message_received'
  message:   string   // texto legible para el usuario
  read:      boolean
  createdAt: string   // ISO
  fromName?: string   // solo aplica cuando hay un remitente
}
```

---

## Flujo de entrega

Toda entrega de notificación pasa por el Admin SDK desde API routes.
El cliente nunca escribe directamente en `notifications/`.

```
Admin aprueba mensaje  →  /api/admin/messages/[id]/approve
                          └─ rtdb.ref(`notifications/${toUid}/${notifId}`).set({
                               type: 'message_received',
                               message: 'Juan te envió 2 mensajes: "Consulta sobre transferencia"',
                               read: false, createdAt, fromName
                             })

Mensaje directo        →  /api/messages/send → deliverToRtdb()
                          └─ rtdb.ref(`notifications/${toUid}/${notifId}`).set({
                               type: 'message_received',
                               message: 'Juan te envió un mensaje: "Consulta sobre transferencia"',
                               read: false, createdAt, fromName
                             })
```

---

## Funciones del cliente

Todas en `web/src/lib/rtdb.ts`:

```ts
// Suscripción realtime (onValue)
subscribeNotifications(uid: string, cb: (notifs: NotificationEntry[]) => void): () => void

// Lectura única
getNotifications(uid: string): Promise<NotificationEntry[]>

// Marcar una como leída
markNotificationRead(uid: string, notifId: string): Promise<void>

// Marcar todas como leídas (batch update)
markAllNotificationsRead(uid: string): Promise<void>

// Agregar una desde el cliente (helper interno — no usar desde UI)
addNotification(uid: string, notif: Omit<NotificationEntry, 'id'>): Promise<string>
```

---

## Componente UI

`NotificationBell` en `web/src/components/layout/Nav.tsx`:

- Suscribe con `subscribeNotifications(uid, setNotifs)` en un `useEffect`
- Badge rojo con conteo de `notifs.filter(n => !n.read).length`
- Si unread > 9 muestra "9+"
- Al hacer click abre el dropdown y llama `markAllNotificationsRead(uid)`
- Dropdown muestra lista de notificaciones ordenadas por `createdAt` desc

---

## Reglas de seguridad RTDB

```json
"notifications": {
  "$uid": {
    ".read":  "auth != null && auth.uid === $uid",
    ".write": false
  }
}
```

Cada usuario solo puede leer sus propias notificaciones.
La escritura es exclusiva del Admin SDK.

---

## Pendiente — extender a otros eventos

Para implementar notificaciones de moderación de perfiles, agregar en `/api/admin/profile-status`:

```ts
// Después de actualizar el status en Firestore/RTDB:
if (status === 'published') {
  await rtdb.ref(`notifications/${uid}/${genId()}`).set({
    type: 'profile_approved',
    message: 'Tu perfil fue aprobado y ya está visible al público.',
    read: false,
    createdAt: new Date().toISOString(),
  })
} else if (status === 'rejected') {
  await rtdb.ref(`notifications/${uid}/${genId()}`).set({
    type: 'profile_rejected',
    message: 'Tu perfil necesita correcciones. Revisá los comentarios del admin.',
    read: false,
    createdAt: new Date().toISOString(),
  })
}
```
