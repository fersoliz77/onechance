import { NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'
import { requireSuperAdmin, writeAuditLog } from '../_lib'

export async function POST(req: Request) {
  const auth = await requireSuperAdmin(req)
  if (!auth.ok) return auth.response

  const { uid, systemRole } = await req.json()
  if (!uid || !['user', 'admin', 'super_admin'].includes(systemRole)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  await getAdminAuth().setCustomUserClaims(uid, { role: systemRole })
  await getAdminDb().collection('users').doc(uid).set({ systemRole }, { merge: true })
  await writeAuditLog({
    actorUid: auth.decoded.uid,
    actorEmail: auth.decoded.email,
    action: 'admin.manage_admins',
    targetCollection: 'users',
    targetUid: uid,
    metadata: { systemRole },
  })

  return NextResponse.json({ ok: true })
}
