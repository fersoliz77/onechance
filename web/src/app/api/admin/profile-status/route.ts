import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { requireAdmin, writeAuditLog, parseBody, ProfileStatusSchema } from '../_lib'

export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const body = parseBody(ProfileStatusSchema, await req.json())
  if (!body.ok) return body.response

  const { collection, uid, status } = body.data
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
