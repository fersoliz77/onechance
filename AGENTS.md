# One Chance — Agent Instructions

This file is read by OpenCode, Claude Code, and any AI agent working on this project.
All rules here are mandatory, not suggestions.

---

## Project structure

```
OneChance/
├── web/                  ← Next.js 16 app (main codebase)
│   ├── src/
│   │   ├── app/          ← App Router pages and API routes
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/          ← Firebase client + admin + helpers
│   │   └── types/
│   ├── firestore.rules   ← SOURCE OF TRUTH for Firestore security
│   ├── database.rules.json ← SOURCE OF TRUTH for RTDB security
│   └── firestore.indexes.json ← SOURCE OF TRUTH for composite indexes
├── docs/
└── .github/
```

All work happens inside `web/`. Run all commands from `web/` unless stated otherwise.

---

## Firebase rules — read this before touching any .rules file

### The repo is the only source of truth

`firestore.rules`, `database.rules.json`, and `firestore.indexes.json` are authoritative.
Do NOT instruct the user to edit rules from the Firebase console.
Console changes are invisible to the repo and get overwritten on the next deploy.
This already caused a production incident on this project.

### Deploy command — always run all three together

```bash
cd web
firebase deploy --only firestore:rules,firestore:indexes,database
```

Never deploy only one or two. Rules and indexes are coupled.

### Admin SDK bypasses all client security rules

Every file under `web/src/app/api/` uses the Firebase Admin SDK.
The Admin SDK ignores `firestore.rules` and `database.rules.json`.
Those rules only protect browser client SDK access.
API route protection is handled by auth middleware inside each route.

### Before making changes, verify production matches the repo

```bash
cd web && firebase firestore:indexes   # should match firestore.indexes.json
```

If production has rules the repo does not → merge into repo files first, then deploy.

### What NOT to do with Firebase

- Do not add `request.auth.token.role` checks inside `isAdmin()` — removed intentionally (security anti-pattern)
- Do not add new Firestore collections without a matching rule in `firestore.rules`
- Do not add new RTDB paths in code without a matching rule in `database.rules.json`
- Do not split the deploy (rules without indexes or vice versa)

---

## Realtime over polling — hard rule

Always use `onSnapshot` (Firestore) or `onValue` (RTDB) for any data that can change.
Never use `setInterval` + `fetch` for live data.
Always return the unsubscribe function in `useEffect` cleanup:

```ts
useEffect(() => {
  const unsub = subscribeToSomething(uid, data => setState(data))
  return unsub   // ← mandatory
}, [uid])
```

---

## Firebase plan — Spark (free)

Cloud Functions require the Blaze (paid) plan. Do not suggest Cloud Functions.
Use Next.js API routes (`web/src/app/api/`) for all server-side logic instead.
Allowed Firebase services: Firestore, Realtime Database, Authentication, Storage, Hosting.

---

## Next.js version — read before writing any route or page

This is Next.js 16. APIs differ significantly from older versions.
Read `web/node_modules/next/dist/docs/` before writing route handlers or page components.
Route params are async: `{ params }: { params: Promise<{ id: string }> }` — always `await params`.

---

## Language

- User-facing text and UI strings → Spanish
- Code identifiers (variables, functions, types, files) → English
- Comments inside components → Spanish when explaining business logic, English otherwise

---

## Key Firebase paths

| What | Where |
|---|---|
| Firebase project | `onechance-platform` |
| RTDB URL | `https://onechance-platform-default-rtdb.firebaseio.com` |
| Admin SDK init | `web/src/lib/firebase-admin.ts` |
| Client SDK init | `web/src/lib/firebase.ts` |
| Auth middleware (user) | `web/src/app/api/messages/_lib.ts` → `requireUser()` |
| Auth middleware (admin) | `web/src/app/api/admin/_lib.ts` → `requireAdmin()` |
| RTDB helpers | `web/src/lib/rtdb.ts` |
| Audit log | `web/src/lib/auditLog.ts` |
