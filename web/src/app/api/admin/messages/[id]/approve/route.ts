import { NextResponse } from 'next/server'
import { getAdminDb, getAdminRtdb } from '@/lib/firebase-admin'
import { requireAdmin, writeAuditLog } from '../../../_lib'
import { genId } from '@/app/api/messages/_lib'
import type { PendingMessage } from '@/types/conversations'

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

  // Idempotency: safe to retry if network failed after RTDB writes but before Firestore update
  if (conv.status === 'approved') {
    return NextResponse.json({ ok: true })
  }
  if (conv.status !== 'pending') {
    return NextResponse.json({ error: 'Only pending conversations can be approved' }, { status: 400 })
  }

  const now      = new Date().toISOString()
  const rtdb     = getAdminRtdb()
  const messages = (Array.isArray(conv.messages) ? conv.messages : []) as PendingMessage[]

  // Deliver all queued messages to recipient RTDB inbox
  const writes: Promise<void>[] = messages.map(msg => {
    const msgId = genId()
    return rtdb.ref(`messages/${conv.toUid}/${msgId}`).set({
      fromUid:   conv.fromUid,
      fromName:  conv.fromName,
      fromRole:  conv.fromRole,
      subject:   conv.subject,
      body:      msg.body,
      read:      false,
      createdAt: msg.sentAt,
    })
  })

  // Single notification consolidating all queued messages
  const notifId = genId()
  writes.push(
    rtdb.ref(`notifications/${conv.toUid}/${notifId}`).set({
      type:      'message_received',
      message:   `${conv.fromName} te envió ${messages.length > 1 ? `${messages.length} mensajes` : 'un mensaje'}: "${conv.subject}"`,
      read:      false,
      createdAt: now,
      fromName:  conv.fromName,
    }),
  )

  // Remove from adminInbox (conversation no longer pending)
  writes.push(rtdb.ref(`adminInbox/${id}`).remove())

  // Update sender's RTDB mirror to 'approved' — they see "Entregado"
  writes.push(
    rtdb.ref(`userConversations/${conv.fromUid}/${id}`).update({
      status:    'approved',
      updatedAt: now,
    }),
  )

  await Promise.all(writes)

  await docRef.update({
    status:         'approved',
    moderatedAt:    now,
    moderatorUid:   auth.decoded.uid,
    moderatorEmail: auth.decoded.email ?? '',
  })

  await writeAuditLog({
    actorUid:         auth.decoded.uid,
    actorEmail:       auth.decoded.email,
    action:           'message_approve',
    targetCollection: 'conversations',
    targetUid:        id,
    metadata:         { fromUid: conv.fromUid, toUid: conv.toUid, messageCount: messages.length },
  })

  return NextResponse.json({ ok: true })
}
