import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { requireOwner } from '@/app/api/admin/_lib'
import { z } from 'zod'

const ROLE_COLLECTION: Record<string, string> = {
  player: 'players',
  coach:  'coaches',
  club:   'clubs',
  agent:  'agents',
}

const UpdateProfileSchema = z.object({
  role: z.enum(['player', 'coach', 'club', 'agent']),
  data: z.record(z.string(), z.unknown()),
})

export async function PUT(req: Request, { params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params

  const auth = await requireOwner(req, uid)
  if (!auth.ok) return auth.response

  const parsed = UpdateProfileSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { role, data } = parsed.data
  const collection = ROLE_COLLECTION[role]
  if (!collection) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })

  // Strip protected fields that the user must not self-assign
  const { status, isFeatured, uid: _uid, ...safeData } = data as Record<string, unknown>
  void status; void isFeatured; void _uid

  await getAdminDb()
    .collection(collection)
    .doc(uid)
    .set({ ...safeData, updatedAt: new Date().toISOString() }, { merge: true })

  return NextResponse.json({ ok: true })
}
