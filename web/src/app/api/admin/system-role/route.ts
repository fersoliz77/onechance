import { NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'
import { requireSuperAdmin, writeAuditLog, parseBody, SystemRoleSchema } from '../_lib'

export async function POST(req: Request) {
  const auth = await requireSuperAdmin(req)
  if (!auth.ok) return auth.response

  const body = parseBody(SystemRoleSchema, await req.json())
  if (!body.ok) return body.response

  const { uid, systemRole } = body.data
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
