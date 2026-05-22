import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { requireOwner } from '@/app/api/admin/_lib'
import { ProfileUpdateSchema, sanitizeProfileUpdate } from '@/lib/profileConsistency'

const ROLE_COLLECTION: Record<string, string> = {
  player: 'players',
  coach:  'coaches',
  club:   'clubs',
  agent:  'agents',
}

export async function PUT(req: Request, { params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params

  const auth = await requireOwner(req, uid)
  if (!auth.ok) return auth.response

  const parsed = ProfileUpdateSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { role, data } = parsed.data
  const collection = ROLE_COLLECTION[role]
  if (!collection) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })

  const safeData = sanitizeProfileUpdate(role, data as Record<string, unknown>)

  await getAdminDb()
    .collection(collection)
    .doc(uid)
    .set({ ...safeData, updatedAt: new Date().toISOString() }, { merge: true })

  return NextResponse.json({ ok: true })
}
