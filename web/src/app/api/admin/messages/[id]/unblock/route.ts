import { NextResponse } from 'next/server'
import { getAdminDb, getAdminRtdb } from '@/lib/firebase-admin'
import { requireAdmin, writeAuditLog } from '../../../_lib'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const { id } = await params
  const db      = getAdminDb()
  const docRef  = db.collection('conversations').doc(id)
  const docSnap = await docRef.get()

  if (!docSnap.exists) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }

  const conv = docSnap.data()!

  if (conv.status !== 'rejected') {
    return NextResponse.json({ error: 'Only rejected conversations can be unblocked' }, { status: 400 })
  }

  const now  = new Date().toISOString()
  const rtdb = getAdminRtdb()

  await Promise.all([
    // Archive the conversation — frees the pair to start fresh
    docRef.update({
      status:         'archived',
      moderatedAt:    now,
      moderatorUid:   auth.decoded.uid,
      moderatorEmail: auth.decoded.email ?? '',
    }),
    // Remove user's RTDB mirror — their sent view clears this thread
    rtdb.ref(`userConversations/${conv.fromUid}/${id}`).remove(),
  ])

  await writeAuditLog({
    actorUid:         auth.decoded.uid,
    actorEmail:       auth.decoded.email,
    action:           'message_unblock',
    targetCollection: 'conversations',
    targetUid:        id,
    metadata:         { fromUid: conv.fromUid, toUid: conv.toUid },
  })

  return NextResponse.json({ ok: true })
}
