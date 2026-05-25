# Firebase Infrastructure — Rules for AI Assistants and Developers

> This document is authoritative. If you are an AI assistant working on this project,
> read and enforce every rule here before touching any Firebase-related file.

---

## Rule 1 — The repository is the only source of truth

Files `firestore.rules`, `database.rules.json`, and `firestore.indexes.json` inside `web/`
are the canonical definitions of all Firebase security rules and indexes.

**Never** instruct the user to edit rules or indexes directly in the Firebase console.
Changes made in the console are invisible to the repo and will be overwritten on the
next deploy. This has already caused a production incident on this project.

---

## Rule 2 — Always deploy the three files together

After any change to `firestore.rules`, `database.rules.json`, or `firestore.indexes.json`:

```bash
cd web
firebase deploy --only firestore:rules,firestore:indexes,database
```

Never deploy only one or two of them. Rules and indexes are interdependent:
a new query added to the code may require both a new index and an updated rule.

---

## Rule 3 — Verify production matches the repo before making changes

If you are unsure whether production is in sync with the repo, run:

```bash
# What composite indexes are currently deployed?
cd web && firebase firestore:indexes

# What RTDB rules are currently deployed? (requires valid Firebase auth token)
node -e "
const fs=require('fs'),os=require('os'),path=require('path'),https=require('https');
const token=JSON.parse(fs.readFileSync(path.join(os.homedir(),'.config','configstore','firebase-tools.json'),'utf8')).tokens.access_token;
https.get('https://onechance-platform-default-rtdb.firebaseio.com/.settings/rules.json?access_token='+token,res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>console.log(JSON.stringify(JSON.parse(d),null,2)));});
"
```

If production has rules that the repo does not — merge them into the repo files first,
then deploy. Do not discard production changes.

---

## Rule 4 — Admin SDK bypasses all client security rules

Every API route in `src/app/api/` uses the Firebase Admin SDK.
The Admin SDK **ignores** `firestore.rules` and `database.rules.json` entirely.
Those rules only apply to reads/writes made by the browser client SDK.

Consequence: adding a Firestore rule does not protect data written by API routes —
that protection must be in the API route itself (authentication middleware, input validation).

---

## Firebase project

| Property | Value |
|---|---|
| Project ID | `onechance-platform` |
| RTDB URL | `https://onechance-platform-default-rtdb.firebaseio.com` |
| Rules files | `web/firestore.rules`, `web/database.rules.json` |
| Indexes file | `web/firestore.indexes.json` |
| Firebase config | `web/firebase.json`, `web/.firebaserc` |

---

## Firestore collections

| Collection | Who can read (client SDK) | Who can write (client SDK) |
|---|---|---|
| `players` / `coaches` / `clubs` / `agents` | Published: anyone. Own doc: owner. All: admin | Owner (cannot self-change `status`/`isFeatured`) or admin |
| `users` | Owner or admin | Owner (cannot self-change `systemRole`, `permissions`, `isActive`) or super\_admin |
| `conversations` | Admin only | Nobody — Admin SDK only |
| `admin_audit_logs` | Admin only | Nobody — Admin SDK only |
| `admin_audit_meta` | Admin only | Nobody — Admin SDK only |

---

## Realtime Database paths

| Path | Client can read | Client can write |
|---|---|---|
| `messages/{uid}` | Only matching `uid` | Nobody — Admin SDK only |
| `notifications/{uid}` | Only matching `uid` | Nobody — Admin SDK only |
| `userConversations/{uid}` | Only matching `uid` | Nobody — Admin SDK only |
| `adminInbox` | Only admin / super\_admin | Nobody — Admin SDK only |
| `profiles/{uid}` | Owner or admin | Owner or admin |
| `videos/{uid}` | Owner or admin | Owner or admin |
| `photos/{uid}` | Owner or admin | Owner or admin |
| `follows/{viewerUid}` | Only matching `viewerUid` | Only matching `viewerUid` |
| `profileMetrics/{uid}` | Any authenticated user | Nobody — Admin SDK only |
| `userRoles/{uid}` | Owner or admin | Only super\_admin (on creation: user can create own with `systemRole: 'user'`) |
| `audit_activity` | Only admin / super\_admin | Nobody — Admin SDK only |

---

## What NOT to do

- Do not add `request.auth.token.role` fallbacks inside `isAdmin()` — this was removed
  from production because it is a security anti-pattern (the client can set custom claims).
- Do not split rules and indexes into separate deploys.
- Do not suggest editing rules from the Firebase console.
- Do not create new Firestore collections without adding them to `firestore.rules`.
- Do not add new RTDB paths in code without adding them to `database.rules.json`.
