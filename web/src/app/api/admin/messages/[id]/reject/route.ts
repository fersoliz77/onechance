import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminDb, getAdminRtdb } from '@/lib/firebase-admin'
import { requireAdmin, writeAuditLog } from '../../../_lib'

const RejectSchema = z.object({
  reason: z.string().max(500).optional(),
})

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

  if (conv.status !== 'pending') {
    return NextResponse.json({ error: 'Only pending conversations can be rejected' }, { status: 400 })
  }

  const body   = await req.json().catch(() => ({}))
  const parsed = RejectSchema.safeParse(body)
  const reason = parsed.success ? (parsed.data.reason ?? '') : ''
  const now    = new Date().toISOString()
  const rtdb   = getAdminRtdb()

  await Promise.all([
    // Remove from adminInbox — no longer pending
    rtdb.ref(`adminInbox/${id}`).remove(),
    // User's mirror keeps status 'pending' — they never know it was rejected
    // (no update to userConversations — status stays as 'pending' = "Enviado")
  ])

  const update: Record<string, unknown> = {
    status:         'rejected',
    moderatedAt:    now,
    moderatorUid:   auth.decoded.uid,
    moderatorEmail: auth.decoded.email ?? '',
  }
  if (reason) update.rejectionReason = reason

  await docRef.update(update)

  await writeAuditLog({
    actorUid:         auth.decoded.uid,
    actorEmail:       auth.decoded.email,
    action:           'message_reject',
    targetCollection: 'conversations',
    targetUid:        id,
    metadata:         { fromUid: conv.fromUid, toUid: conv.toUid, reason: reason || null },
  })

  return NextResponse.json({ ok: true })
}
