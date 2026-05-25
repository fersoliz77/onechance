# Sistema de Mensajería Moderada — Documentación técnica

> Implementado: 2026-05-25
> Estado: en producción

---

## Concepto

Sistema de mensajería entre todos los roles de la plataforma (jugador, técnico, club, representante)
con moderación administrativa invisible al usuario. El emisor nunca sabe que existe moderación.

### Reglas de negocio

| Regla | Detalle |
|---|---|
| Moderación inicial | El primer mensaje a un nuevo destinatario pasa por cola de admin |
| Hilo aprobado | Una vez aprobado, todos los mensajes futuros entre ese par se entregan directo |
| Máximo pending | 3 mensajes por conversación mientras está pendiente (luego se ignoran silenciosamente) |
| Rechazo | Bloqueo permanente. El emisor nunca lo sabe — sigue viendo "Enviado" |
| Desbloqueo | Solo el admin puede archivar la conversación rechazada para liberar al par |
| Respuestas | Si B→A tiene conversación aprobada, cualquier reply de A→B va directo sin moderación |
| Auto-mensaje | Bloqueado — no se puede escribir a uno mismo |

---

## Flujo de estados

```
                    ┌─────────┐
  send() ──────────▶│ pending │
                    └────┬────┘
                    admin│
           ┌─────────────┼─────────────┐
           ▼             ▼             ▼
      ┌──────────┐  ┌──────────┐  (sin acción)
      │ approved │  │ rejected │
      └──────────┘  └────┬─────┘
   futuros mensajes      │ admin unblock
   entre el par          ▼
   van directo      ┌──────────┐
                    │ archived │  ← par queda libre para iniciar nueva conversación
                    └──────────┘
```

**Lo que ve el emisor en todo momento:**
- `pending` → "Enviado ✓"
- `rejected` → "Enviado ✓" (nunca sabe)
- `approved` → "✓ Entregado"
- `archived` → "Enviado ✓"

---

## Arquitectura de datos

### Firestore — fuente de verdad

Colección: `conversations/{convId}`

```ts
{
  fromUid:        string          // emisor
  fromName:       string
  fromRole:       'player' | 'coach' | 'club' | 'agent'
  toUid:          string          // destinatario
  toName:         string
  toRole:         'player' | 'coach' | 'club' | 'agent'
  subject:        string
  status:         'pending' | 'approved' | 'rejected' | 'archived'
  messageCount:   number          // 1–3
  messages:       PendingMessage[]  // cuerpos de mensajes encolados
  createdAt:      string          // ISO
  updatedAt:      string
  // campos admin-only (nunca se devuelven al usuario):
  moderatorUid?:  string
  moderatorEmail?: string
  moderatedAt?:   string
  rejectionReason?: string
}

type PendingMessage = { id: string; body: string; sentAt: string }
```

### RTDB — espejos en tiempo real

| Path | Contenido | Quién lee |
|---|---|---|
| `adminInbox/{convId}` | `{ fromName, fromRole, toName, toRole, subject, createdAt }` | Admins — badge de pendientes |
| `userConversations/{fromUid}/{convId}` | `{ toUid, toName, toRole, subject, status, messageCount, createdAt, updatedAt }` | Emisor — estado de sus enviados |
| `messages/{toUid}/{msgId}` | `{ fromUid, fromName, fromRole, subject, body, read, createdAt }` | Destinatario — inbox |
| `notifications/{toUid}/{notifId}` | `{ type, message, read, createdAt, fromName }` | Destinatario — notificaciones |

**Invariante crítica:** los writes a RTDB siempre usan el Admin SDK (desde API routes).
El cliente nunca escribe directamente a estos paths.

---

## API Routes

### `POST /api/messages/send`
Envía un mensaje. Detecta el estado de la conversación y actúa:

```
1. Query paralela: forward (A→B) + reverse (B→A) — usando compound queries con índice compuesto
2. Si forward activo:
   - rejected  → return ok (silencioso)
   - approved  → deliverToRtdb() directo
   - pending   → append si messageCount < 3, else return ok (silencioso)
3. Si reverse approved → deliverToRtdb() directo (respuesta sin moderación)
4. Ningún caso → crear nueva conversación pending en Firestore + RTDB adminInbox + userConversations
```

**Índice Firestore requerido:** `conversations` — `(fromUid ASC, toUid ASC)`

### `GET /api/messages/sent`
Devuelve `ConversationSafe[]` del usuario autenticado. Omite campos admin-only.

### `POST /api/admin/messages/[id]/approve`
- Idempotente: si ya está aprobado, retorna ok sin re-entregar
- Entrega todos los mensajes encolados al RTDB del destinatario
- Una sola notificación consolidando todos los mensajes
- Remueve de `adminInbox`, actualiza espejo emisor a `approved`

### `POST /api/admin/messages/[id]/reject`
- Solo modifica Firestore a `rejected`
- Remueve de `adminInbox`
- NO modifica el espejo RTDB del emisor (sigue viendo "Enviado")

### `POST /api/admin/messages/[id]/unblock`
- Archiva la conversación en Firestore
- Remueve el espejo RTDB del emisor
- El par queda libre para iniciar nueva conversación

### `GET /api/admin/messages`
Devuelve conversaciones con filtro opcional `?status=pending|approved|rejected|archived`.

---

## Componentes frontend

### `MessagesSection.tsx`
`web/src/features/dashboard/components/sections/MessagesSection.tsx`

- **Inbox:** `subscribeMessages(uid, cb)` — RTDB `onValue`, tiempo real
- **Enviados:** fetch inicial de Firestore vía API + `subscribeUserConversations(uid, cb)` — overlay de estados en tiempo real desde RTDB
- **Reply:** formulario inline en el modal de inbox → llama `POST /api/messages/send`

### `AdminMessagesTab.tsx`
`web/src/components/admin/AdminMessagesTab.tsx`

- Firestore `onSnapshot` sobre colección `conversations` — tiempo real, sin polling
- Tabs: Pendientes / Aprobadas / Rechazadas / Todas
- Badge de pendientes: `subscribeAdminInbox(cb)` en `admin/page.tsx` — funciona en cualquier tab

### `ContactModal.tsx`
`web/src/components/ui/ContactModal.tsx`

- Llama `POST /api/messages/send`
- Recibe `toRole` como prop (player/coach/club/agent)
- El usuario ve "Tu mensaje fue enviado" siempre — sin mención de moderación

---

## Funciones RTDB del cliente

Todas en `web/src/lib/rtdb.ts`:

```ts
subscribeMessages(uid, cb)            // inbox en tiempo real
subscribeUserConversations(uid, cb)   // estados enviados en tiempo real
subscribeAdminInbox(cb)               // conteo pendientes para badge admin
markMessageRead(uid, messageId)       // marcar leído
```

---

## Seguridad

### Qué está protegido

- `rejectionReason` nunca sale al cliente — solo existe en Firestore
- `moderatorUid`, `moderatorEmail`, `moderatedAt` — solo en Firestore, nunca en RTDB mirror ni en API pública
- `ConversationSafe` (tipo TypeScript) omite todos los campos admin-only
- RTDB `userConversations` del emisor no incluye motivo de rechazo
- Status de rechazo no se refleja en el espejo RTDB (se queda como `pending`)

### Reglas de acceso

- Firestore `conversations`: write = false para cliente; read = solo admin
- RTDB `messages/{uid}`: read = solo ese uid; write = false (solo Admin SDK)
- RTDB `userConversations/{uid}`: ídem
- RTDB `adminInbox`: read = solo admin/super_admin; write = false

---

## Decisiones de diseño y por qué

**¿Por qué RTDB y no Firestore para el inbox?**
El inbox del usuario (`messages/{uid}`) es solo un depósito de entrega — no necesita ser
consultable por múltiples criterios. RTDB es más barato y rápido para lecturas de lista simple.

**¿Por qué el espejo `userConversations` en RTDB?**
Para evitar que el usuario haga queries a Firestore (donde están los datos sensibles).
El espejo solo tiene los campos seguros y se actualiza en tiempo real via `onValue`.

**¿Por qué no Cloud Functions?**
El proyecto está en el plan Spark (gratuito). Cloud Functions requieren Blaze (pago).
Todo el lado servidor corre en Next.js API routes.

**¿Por qué queries compuestas en lugar de filtrar en memoria?**
La versión original traía TODAS las conversaciones del usuario para filtrar por `toUid`
en JavaScript. Reemplazado por `where('fromUid').where('toUid')` con índice compuesto —
O(1) por par en lugar de O(n) sobre el historial completo.
