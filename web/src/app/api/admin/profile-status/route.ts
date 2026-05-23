import { NextResponse } from 'next/server'
import { getAdminDb, getAdminRtdb } from '@/lib/firebase-admin'
import { requireAdmin, writeAuditLog, parseBody, ProfileStatusSchema } from '../_lib'

export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const body = parseBody(ProfileStatusSchema, await req.json())
  if (!body.ok) return body.response

  const { collection, uid, status, rejectionReason } = body.data

  const firestoreUpdate: Record<string, unknown> = { status }
  if (status === 'rejected' && rejectionReason) {
    firestoreUpdate.rejectionReason = rejectionReason
  } else if (status !== 'rejected') {
    firestoreUpdate.rejectionReason = null
  }

  await getAdminDb().collection(collection).doc(uid).set(firestoreUpdate, { merge: true })
  try {
    await getAdminRtdb().ref(`profiles/${uid}`).update({ status })
  } catch (rtdbErr) {
    console.warn('[profile-status] RTDB update skipped:', rtdbErr)
  }
  try {
    await writeAuditLog({
      actorUid: auth.decoded.uid,
      actorEmail: auth.decoded.email,
      action: `profiles.${status}`,
      targetCollection: collection,
      targetUid: uid,
    })
  } catch (auditErr) {
    console.warn('[profile-status] audit log skipped:', auditErr)
  }

  return NextResponse.json({ ok: true })
}
