# Copilot Instructions — One Chance Platform

## Stack

Next.js 16 App Router · Firebase (Firestore + Realtime Database) · TypeScript · Tailwind CSS.
Source is in `web/`. All Firebase config files are in `web/`.

## Critical: Firebase infrastructure rules

Read `web/FIREBASE.md` in full before suggesting any change to Firebase rules or indexes.
The short version:

**The repo is the only source of truth.** Never instruct the user to edit
`firestore.rules`, `database.rules.json`, or `firestore.indexes.json` via the Firebase
console. Those changes are invisible to the repo and get overwritten on the next deploy.

**After any change to those three files, always run:**
```bash
cd web && firebase deploy --only firestore:rules,firestore:indexes,database
```
Deploy all three together — never split them.

**Admin SDK (all files under `web/src/app/api/`) ignores security rules.**
Rules only protect client SDK access. API route protection comes from auth middleware.

## Realtime over polling

Always use `onSnapshot` (Firestore) or `onValue` (RTDB) for any data that can change.
Never use `setInterval` + `fetch`. Always return the unsubscribe function in `useEffect` cleanup.

## Firebase plan

This project is on the Spark (free) plan. Cloud Functions require Blaze (paid) and are
forbidden. Use Next.js API routes instead of Cloud Functions for all server-side logic.

## Language

All user-facing text, comments in components, and commit messages are in Spanish.
Code identifiers (variables, functions, types) are in English.
