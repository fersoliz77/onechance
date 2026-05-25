# One Chance — Gemini / Antigravity Instructions

> Full project rules are in AGENTS.md (same directory). This file adds Gemini-specific
> overrides and highlights the most critical rules for every request.

## STOP — read before any Firebase change

The files `web/firestore.rules`, `web/database.rules.json`, and `web/firestore.indexes.json`
are the only source of truth for Firebase security and indexes.

**Never** suggest editing rules from the Firebase console.
**Always** deploy all three together after any change:

```bash
cd web && firebase deploy --only firestore:rules,firestore:indexes,database
```

Deploying only rules OR only indexes will break the application.

## Hard rules (apply to every response)

**No polling.** Use `onSnapshot` (Firestore) or `onValue` (RTDB) for live data.
Always return the unsubscribe function in `useEffect` cleanup.

**No Cloud Functions.** This project is on the Firebase Spark (free) plan.
Use Next.js API routes in `web/src/app/api/` for all server-side logic.

**Admin SDK ignores security rules.** Files in `web/src/app/api/` use the Admin SDK —
security rules only apply to browser client SDK calls.

**Next.js 16 — params are async.** Always `await params` before destructuring:
```ts
const { id } = await params   // correct
const { id } = params          // wrong — breaks in Next.js 16
```

## Project

Firebase project: `onechance-platform` · Stack: Next.js 16 + Firebase + TypeScript + Tailwind
All source code is in `web/`. Run commands from `web/` unless stated otherwise.
UI text and business logic comments → Spanish. Code identifiers → English.
