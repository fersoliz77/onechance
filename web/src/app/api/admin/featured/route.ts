import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { requireAdmin, writeAuditLog } from '../_lib'

export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const { uid, isFeatured } = await req.json()
  if (!uid || typeof isFeatured !== 'boolean') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  await getAdminDb().collection('players').doc(uid).set({ isFeatured }, { merge: true })
  await writeAuditLog({
    actorUid: auth.decoded.uid,
    actorEmail: auth.decoded.email,
    action: 'featured.set',
    targetCollection: 'players',
    targetUid: uid,
    metadata: { isFeatured },
  })

  return NextResponse.json({ ok: true })
}
