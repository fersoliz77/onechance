<!-- BEGIN:nextjs-agent-rules -->
# Next.js — Agent Instructions

> For Firebase rules, deploy process, and project-wide rules: read `../AGENTS.md` (repo root).
> For Firebase-specific details: read `FIREBASE.md` (this directory).

## This is NOT the Next.js you know

This version (16) has breaking changes — APIs, conventions, and file structure differ
from training data. Read `node_modules/next/dist/docs/` before writing any code.

Key differences from Next.js 13-15:
- Route segment params are async: always `await params` before destructuring
- `{ params }: { params: Promise<{ id: string }> }` — not `{ params: { id: string } }`

Heed all deprecation notices. Do not assume older patterns work.
<!-- END:nextjs-agent-rules -->
