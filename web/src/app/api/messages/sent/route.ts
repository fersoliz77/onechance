import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { requireUser } from '../_lib'
import type { ConversationSafe } from '@/types/conversations'

export async function GET(req: Request) {
  const auth = await requireUser(req)
  if (!auth.ok) return auth.response

  const fromUid = auth.decoded.uid

  const snap = await getAdminDb()
    .collection('conversations')
    .where('fromUid', '==', fromUid)
    .get()

  const conversations: ConversationSafe[] = snap.docs
    .map(d => {
      const data = d.data()
      return {
        id:           d.id,
        fromUid:      data.fromUid   ?? '',
        fromName:     data.fromName  ?? '',
        fromRole:     data.fromRole  ?? 'player',
        toUid:        data.toUid     ?? '',
        toName:       data.toName    ?? '',
        toRole:       data.toRole    ?? 'player',
        subject:      data.subject   ?? '',
        status:       data.status    ?? 'pending',
        messageCount: data.messageCount ?? 1,
        messages:     Array.isArray(data.messages) ? data.messages : [],
        createdAt:    data.createdAt ?? '',
        updatedAt:    data.updatedAt ?? '',
      } as ConversationSafe
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return NextResponse.json({ conversations })
}
