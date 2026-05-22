import { NextResponse } from 'next/server'
import { requireSuperAdmin, writeAuditLog } from '../_lib'
import { getAdminDb } from '@/lib/firebase-admin'

export async function POST(req: Request) {
  const auth = await requireSuperAdmin(req)
  if (!auth.ok) return auth.response

  const db = getAdminDb()
  const collections = ['players', 'coaches', 'clubs', 'agents']
  let totalDeleted = 0

  for (const col of collections) {
    const snap = await db.collection(col).where('status', '==', 'rejected').get()
    if (snap.empty) continue
    const batch = db.batch()
    snap.docs.forEach(doc => batch.delete(doc.ref))
    await batch.commit()
    totalDeleted += snap.docs.length
  }

  await writeAuditLog({
    actorUid: auth.decoded.uid,
    actorEmail: auth.decoded.email,
    action: 'purge_rejected_profiles',
    metadata: { deleted: totalDeleted },
  })

  return NextResponse.json({ ok: true, deleted: totalDeleted })
}
