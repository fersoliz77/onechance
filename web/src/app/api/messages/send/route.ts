import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminDb, getAdminRtdb } from '@/lib/firebase-admin'
import { requireUser, genId } from '../_lib'

const SendSchema = z.object({
  toUid:   z.string().min(1),
  toName:  z.string().min(1).max(100),
  toRole:  z.enum(['player', 'coach', 'club', 'agent']),
  subject: z.string().min(1).max(120),
  body:    z.string().min(1).max(1000),
})

// Deliver a message directly to recipient RTDB inbox + notification
async function deliverToRtdb(params: {
  toUid:    string
  fromUid:  string
  fromName: string
  fromRole: string
  subject:  string
  body:     string
  now:      string
}) {
  const { toUid, fromUid, fromName, fromRole, subject, body, now } = params
  const rtdb     = getAdminRtdb()
  const msgId    = genId()
  const notifId  = genId()
  await Promise.all([
    rtdb.ref(`messages/${toUid}/${msgId}`).set({
      fromUid, fromName, fromRole, subject, body, read: false, createdAt: now,
    }),
    rtdb.ref(`notifications/${toUid}/${notifId}`).set({
      type: 'message_received',
      message: `${fromName} te envió un mensaje: "${subject}"`,
      read: false, createdAt: now, fromName,
    }),
  ])
}

export async function POST(req: Request) {
  const auth = await requireUser(req)
  if (!auth.ok) return auth.response

  const raw    = await req.json().catch(() => null)
  const parsed = SendSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { toUid, toName, toRole, subject, body } = parsed.data
  const fromUid  = auth.decoded.uid
  const fromName = (auth.userData.name || auth.decoded.email || 'Usuario') as string
  const fromRole = (auth.userData.role as string) || 'player'
  const now      = new Date().toISOString()
  const db       = getAdminDb()

  if (fromUid === toUid) {
    return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })
  }

  // ── Run both direction queries in parallel (compound queries: O(1) per pair) ──
  const [forwardSnap, reverseSnap] = await Promise.all([
    db.collection('conversations')
      .where('fromUid', '==', fromUid)
      .where('toUid', '==', toUid)
      .get(),
    db.collection('conversations')
      .where('fromUid', '==', toUid)
      .where('toUid', '==', fromUid)
      .get(),
  ])

  // ── 1. Check forward direction ──────────────────────────────────────────────
  const forwardActive = forwardSnap.docs
    .filter(d => d.data().status !== 'archived')
    .sort((a, b) => ((b.data().createdAt ?? '') as string).localeCompare(a.data().createdAt ?? ''))[0] ?? null

  if (forwardActive) {
    const conv = forwardActive.data()

    // Permanently rejected — silently swallow, user sees ✓
    if (conv.status === 'rejected') {
      return NextResponse.json({ ok: true })
    }

    // Already approved — deliver directly
    if (conv.status === 'approved') {
      await deliverToRtdb({ toUid, fromUid, fromName, fromRole, subject, body, now })
      return NextResponse.json({ ok: true })
    }

    // Pending — append if under cap
    if (conv.status === 'pending') {
      const currentCount    = (conv.messageCount as number) ?? 1
      const currentMessages = Array.isArray(conv.messages) ? conv.messages : []

      if (currentCount >= 3) {
        return NextResponse.json({ ok: true }) // silently cap
      }

      const newCount = currentCount + 1
      await Promise.all([
        forwardActive.ref.update({
          messageCount: newCount,
          messages:     [...currentMessages, { id: genId(), body, sentAt: now }],
          updatedAt:    now,
        }),
        // Keep RTDB mirror in sync
        getAdminRtdb().ref(`userConversations/${fromUid}/${forwardActive.id}`).update({
          messageCount: newCount,
          updatedAt:    now,
        }),
      ])
      return NextResponse.json({ ok: true })
    }
  }

  // ── 2. Check reverse direction: B→A approved means A's reply goes direct ───
  const reverseApproved = reverseSnap.docs.find(d => d.data().status === 'approved') ?? null

  if (reverseApproved) {
    await deliverToRtdb({ toUid, fromUid, fromName, fromRole, subject, body, now })
    return NextResponse.json({ ok: true })
  }

  // ── 3. No active conversation in either direction — create new pending thread ──
  const convRef = db.collection('conversations').doc()
  const convId  = convRef.id
  const rtdb    = getAdminRtdb()

  await Promise.all([
    // Firestore: source of truth for moderation
    convRef.set({
      fromUid, fromName, fromRole,
      toUid,   toName,   toRole,
      subject,
      status:       'pending',
      messageCount: 1,
      messages:     [{ id: genId(), body, sentAt: now }],
      createdAt:    now,
      updatedAt:    now,
    }),
    // RTDB adminInbox: real-time badge for admins
    rtdb.ref(`adminInbox/${convId}`).set({
      fromName, fromRole, toName, toRole, subject, createdAt: now,
    }),
    // RTDB userConversations: real-time status mirror for the sender
    rtdb.ref(`userConversations/${fromUid}/${convId}`).set({
      toUid, toName, toRole, subject,
      status:       'pending',
      messageCount: 1,
      createdAt:    now,
      updatedAt:    now,
    }),
  ])

  return NextResponse.json({ ok: true })
}
