# Firebase Infrastructure — Reglas de despliegue y sincronización

> Implementado: 2026-05-25
> Referencia técnica complementaria: `web/FIREBASE.md`

---

## Fuentes de verdad

| Archivo | Qué controla |
|---|---|
| `web/firestore.rules` | Seguridad de lectura/escritura en Firestore (SDK cliente) |
| `web/database.rules.json` | Seguridad de lectura/escritura en RTDB (SDK cliente) |
| `web/firestore.indexes.json` | Índices compuestos para queries complejas |

**Regla absoluta:** estos tres archivos son los únicos canónicos.
Cualquier cambio hecho directamente en la consola de Firebase es invisible al repo y se pierde en el próximo deploy.
Este proyecto ya sufrió un incidente por esto (2026-05-25): reglas de producción habían sido mejoradas desde la consola sin commitear, y el repo había regresado a una versión menos segura.

---

## Comando de deploy — siempre los tres juntos

```bash
cd web
firebase deploy --only firestore:rules,firestore:indexes,database
```

Nunca hacer deploy parcial. Los tres están acoplados: una query nueva puede requerir un índice nuevo y una regla nueva al mismo tiempo.

---

## Verificar sincronización prod vs repo

```bash
# Índices compuestos en producción
cd web && firebase firestore:indexes

# Reglas RTDB en producción (requiere token Firebase vigente)
node -e "
const fs=require('fs'),os=require('os'),path=require('path'),https=require('https');
const token=JSON.parse(fs.readFileSync(path.join(os.homedir(),'.config','configstore','firebase-tools.json'),'utf8')).tokens.access_token;
https.get('https://onechance-platform-default-rtdb.firebaseio.com/.settings/rules.json?access_token='+token,res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>console.log(JSON.stringify(JSON.parse(d),null,2)));});
"
```

Si producción tiene reglas que el repo no tiene → mergear al repo primero, luego deployar.
No descartar cambios de producción sin analizarlos.

---

## Procedimiento completo de cambio de reglas

1. Editar el/los archivo(s) en `web/` (nunca en la consola)
2. Verificar sintaxis: `cd web && firebase firestore:rules` (para Firestore)
3. Commitear los cambios al repo
4. Deployar: `cd web && firebase deploy --only firestore:rules,firestore:indexes,database`
5. Verificar con `firebase firestore:indexes` que el deploy fue exitoso

---

## Colecciones Firestore y sus reglas

| Colección | Lectura (cliente) | Escritura (cliente) |
|---|---|---|
| `players` | Published: público. Propio: owner. Todas: admin | Owner (sin `status`/`isFeatured`) o admin |
| `coaches` | Published: público. Propio: owner. Todas: admin | Owner (sin `status`) o admin |
| `clubs` | Published: público. Propio: owner. Todas: admin | Owner (sin `status`) o admin |
| `agents` | Published: público. Propio: owner. Todas: admin | Owner (sin `status`) o admin |
| `users` | Propio o admin | Owner (sin `systemRole`/`permissions`/`isActive`) o super_admin |
| `conversations` | Solo admin | Nadie — solo Admin SDK |
| `admin_audit_logs` | Solo admin | Nadie — solo Admin SDK |
| `admin_audit_meta` | Solo admin | Nadie — solo Admin SDK |

---

## Paths RTDB y sus reglas

| Path | Lectura (cliente) | Escritura (cliente) |
|---|---|---|
| `messages/{uid}` | Solo el `uid` dueño | Nadie — solo Admin SDK |
| `notifications/{uid}` | Solo el `uid` dueño | Nadie — solo Admin SDK |
| `userConversations/{uid}` | Solo el `uid` dueño | Nadie — solo Admin SDK |
| `adminInbox` | Solo admin/super_admin | Nadie — solo Admin SDK |
| `profiles/{uid}` | Owner o admin | Owner o admin |
| `videos/{uid}` | Owner o admin | Owner o admin |
| `photos/{uid}` | Owner o admin | Owner o admin |
| `follows/{viewerUid}` | Solo el `viewerUid` | Solo el `viewerUid` |
| `profileMetrics/{uid}` | Cualquier usuario auth | Nadie — solo Admin SDK |
| `userRoles/{uid}` | Owner o admin | Solo super_admin |
| `audit_activity` | Solo admin/super_admin | Nadie — solo Admin SDK |

---

## Admin SDK vs Client SDK

El Admin SDK (usado en todos los archivos de `web/src/app/api/`) **ignora completamente** las
reglas de Firestore y RTDB. La protección en los API routes es responsabilidad del middleware
de autenticación en cada route (`requireUser()`, `requireAdmin()`), no de las security rules.

Las security rules solo aplican a calls desde el browser (Client SDK).

---

## Seguridad: qué NO hacer

- No agregar `request.auth.token.role` dentro de `isAdmin()` — fue removido intencionalmente porque es un anti-patrón (el cliente puede setear custom claims)
- No crear colecciones Firestore nuevas sin regla en `firestore.rules`
- No agregar paths RTDB nuevos en código sin regla en `database.rules.json`
- No editar reglas desde la consola de Firebase
- No hacer deploy parcial (solo rules sin indexes o viceversa)

---

## Estado del deploy (2026-05-25)

Último deploy completo: 2026-05-25.
Incluye:
- Reglas de conversaciones (`conversations`: write=false, read=admin)
- 7 nuevos paths RTDB (messages, notifications, userConversations, adminInbox, follows, profileMetrics, audit_activity)
- 2 índices compuestos para `conversations` (fromUid+toUid, fromUid+status)
- Función `isSuperAdmin()` separada de `isAdmin()` en Firestore rules
- Eliminación de `request.auth.token.role` fallbacks (anti-patrón de seguridad)
