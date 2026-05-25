# Bitácora de ejecución — 2026-05-25

Sesión completa de implementación y auditoría de seguridad. Incluye: sistema de mensajería
moderada, corrección de reglas Firebase, y configuración de agentes IA.

---

## 1. Sistema de mensajería moderada

### Contexto

El sistema existía en borradores pero tenía varios problemas de producción:
- El API route de send traía TODAS las conversaciones del usuario para filtrar en memoria → O(n)
- No había reglas RTDB para los paths de mensajería → el cliente no podía leer su inbox
- El route de approve no era idempotente → en retry del admin se duplicaban los mensajes entregados
- MessagesSection usaba polling en lugar de onValue
- No había botón de Reply en el inbox

### Cambios implementados

**`web/src/app/api/messages/send/route.ts`** — reescritura completa:
- Queries paralelas con compound equality (`where('fromUid').where('toUid')`) → O(1) por par
- Verificación del par inverso (B→A aprobado = reply de A→B va directo sin moderación)
- `toUid` y `createdAt` agregados al espejo RTDB `userConversations/{uid}`

**`web/src/app/api/admin/messages/[id]/approve/route.ts`** — idempotencia:
- Si `conv.status === 'approved'` → return ok sin re-entregar (fix para retry del admin)
- Si `conv.status !== 'pending'` → 400 con mensaje claro

**`web/src/features/dashboard/components/sections/MessagesSection.tsx`** — reescritura:
- Inbox: `subscribeMessages(uid, cb)` → RTDB `onValue`, tiempo real
- Enviados: fetch inicial API (para tener los cuerpos completos) + `subscribeUserConversations` para overlay de estados
- `rtdbMirrorsRef` para aplicar estado RTDB inmediatamente al cargar datos de la API
- Componente `ReplyForm` inline: reply desde el modal de inbox, llama `POST /api/messages/send`
- Botón "Responder" toggle en `InboxDetail`

**`web/src/app/admin/page.tsx`**:
- Import de `subscribeAdminInbox`
- `useEffect` que suscribe al badge de mensajes pendientes en tiempo real

**`web/src/lib/rtdb.ts`** — 3 nuevas funciones:
- `subscribeMessages(uid, cb)` — inbox en tiempo real
- `subscribeUserConversations(uid, cb)` — estados de enviados en tiempo real
- `subscribeAdminInbox(cb)` — conteo de pendientes para badge admin

---

## 2. Auditoría y corrección de reglas Firebase

### Problema encontrado

Las reglas de producción estaban adelantadas respecto al repo. Alguien había desplegado
mejoras de seguridad directamente desde la consola de Firebase sin commitear al repo.
El repo tenía una versión regresiva más antigua.

Diferencias encontradas:
- `isAdmin()` en Firestore rules tenía fallback `request.auth.token.role` → anti-patrón de seguridad (el cliente puede setear custom claims)
- Sin función `isSuperAdmin()` separada
- Sin reglas para `conversations`, `admin_audit_logs`, `admin_audit_meta`
- Sin reglas RTDB para `messages/`, `notifications/`, `userConversations/`, `adminInbox/`, `follows/`, `profileMetrics/`, `audit_activity`
- Sin índices compuestos para `conversations` en Firestore

### Proceso de corrección

1. Se leyeron las reglas de producción via Firebase REST API y RTDB REST API
2. Se mergearon las mejoras de producción al repo
3. Se agregaron las reglas faltantes para mensajería y paths nuevos
4. Se eliminaron los fallbacks `request.auth.token.role` de `isAdmin()`
5. Se agregó función `isSuperAdmin()` separada de `isAdmin()`
6. Se agregaron 2 índices compuestos para `conversations`
7. Deploy completo: `firebase deploy --only firestore:rules,firestore:indexes,database`

### Regla operativa establecida

**El repo es la única fuente de verdad.** La consola de Firebase no es canónica.
Cualquier cambio en la consola debe commitarse al repo antes o perderse.
Documentado en `web/FIREBASE.md` y `AGENTS.md`.

---

## 3. Configuración de agentes IA

### Contexto

El proyecto usa múltiples herramientas IA: Claude Code (CLI), Antigravity IDE con Gemini,
y OpenCode (terminal) con Claude y OpenAI. Cada herramienta tiene su propio mecanismo
de carga de contexto. Necesitábamos que todas conocieran las reglas críticas del proyecto.

### Archivos creados

| Archivo | Herramienta | Formato |
|---|---|---|
| `AGENTS.md` (raíz) | OpenCode, Claude Code, cross-tool | Markdown estándar |
| `GEMINI.md` (raíz) | Antigravity IDE con Gemini | Markdown compacto (<500 tokens) |
| `opencode.json` (raíz) | OpenCode terminal | `{"instructions": ["AGENTS.md", "web/FIREBASE.md"]}` |
| `web/opencode.json` | OpenCode desde `web/` | `{"instructions": ["../AGENTS.md", "FIREBASE.md"]}` |
| `web/CLAUDE.md` | Claude Code | `@../AGENTS.md @AGENTS.md @FIREBASE.md` |
| `web/AGENTS.md` | Next.js 16 reminder | Referencia al AGENTS.md raíz |
| `web/FIREBASE.md` | Todos | Referencia técnica detallada Firebase |
| `.github/copilot-instructions.md` | GitHub Copilot | Markdown estándar |

### Investigación realizada

Se consultó documentación pública de Antigravity IDE para confirmar que:
- Lee `GEMINI.md` en la raíz como instrucciones prioritarias
- Luego carga `AGENTS.md` como contexto adicional
- El formato recomendado es <500 tokens para el archivo primario

---

## 4. Documentación creada en esta sesión

| Archivo | Contenido |
|---|---|
| `docs/20_messaging_system.md` | Arquitectura completa del sistema de mensajería |
| `docs/21_firebase_infrastructure.md` | Reglas de deploy Firebase, sync prod/repo, permisos |
| `docs/22_ai_agent_setup.md` | Configuración de todos los agentes IA |
| `docs/23_profile_visit_tracking.md` | Sistema de tracking de visitas a perfiles |
| `docs/24_notification_system.md` | Sistema de notificaciones en tiempo real |
| `docs/25_execution_log_2026-05-25.md` | Esta bitácora |
| `docs/00_index.md` | Actualizado con docs 20-25 |
| `docs/05_data_model.md` | Agregada colección `conversations` y paths RTDB de mensajería |
| `docs/06_features.md` | Marcada Fase 5 (mensajería) como implementada |
| `docs/13_security_and_operations_runbook.md` | Operaciones de mensajería + procedimiento Firebase deploy |

---

## 5. Decisiones de diseño tomadas en esta sesión

**¿Por qué no usar Cloud Functions para entregar notificaciones?**
El proyecto está en Firebase Spark (gratuito). Cloud Functions requieren Blaze (pago).
Toda la lógica de entrega corre en Next.js API routes que se despliegan en Vercel.

**¿Por qué el espejo `userConversations` en RTDB y no Firestore?**
Para evitar que el cliente haga queries a Firestore donde están los campos sensibles
(`rejectionReason`, `moderatorUid`, etc.). El espejo RTDB solo expone campos seguros
y se actualiza en tiempo real via `onValue`.

**¿Por qué queries compuestas en lugar de filtrar en memoria?**
La versión original traía todas las conversaciones de un usuario y filtraba en JS.
Las queries `where('fromUid').where('toUid')` con índice compuesto son O(1) por par.

**¿Por qué `GEMINI.md` separado de `AGENTS.md`?**
Antigravity recomienda archivos de instrucciones compactos (<500 tokens) para que quepan
en el contexto inicial. `AGENTS.md` es más completo y verboso — se carga como contexto
adicional. `GEMINI.md` destaca solo las reglas más críticas que nunca deben violarse.
