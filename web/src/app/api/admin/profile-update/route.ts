import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin, writeAuditLog } from '../_lib'
import { getAdminDb } from '@/lib/firebase-admin'
import { sanitizeProfileUpdate } from '@/lib/profileConsistency'
import type { Role } from '@/types'

const Body = z.object({
  uid:  z.string().min(1),
  role: z.enum(['player', 'coach', 'club', 'agent']),
  data: z.record(z.string(), z.unknown()),
})

const COL: Record<Role, string> = {
  player: 'players',
  coach:  'coaches',
  club:   'clubs',
  agent:  'agents',
}

export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  let body: z.infer<typeof Body>
  try {
    body = Body.parse(await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { uid, role, data } = body
  const sanitized = sanitizeProfileUpdate(role, data as Record<string, unknown>)

  if (Object.keys(sanitized).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const db = getAdminDb()
  await db.collection(COL[role]).doc(uid).update({
    ...sanitized,
    updatedAt: new Date().toISOString(),
  })

  await writeAuditLog({
    actorUid:   auth.decoded.uid,
    actorEmail: auth.decoded.email,
    action:     'admin_profile_edit',
    metadata:   { uid, role, fields: Object.keys(sanitized) },
  })

  return NextResponse.json({ ok: true })
}
