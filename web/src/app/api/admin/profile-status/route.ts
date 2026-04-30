import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { requireAdmin, writeAuditLog } from '../_lib'

export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const { collection, uid, status } = await req.json()
  if (!collection || !uid || !status) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  await getAdminDb().collection(collection).doc(uid).set({ status }, { merge: true })
  await writeAuditLog({
    actorUid: auth.decoded.uid,
    actorEmail: auth.decoded.email,
    action: `profiles.${status}`,
    targetCollection: collection,
    targetUid: uid,
  })

  return NextResponse.json({ ok: true })
}
