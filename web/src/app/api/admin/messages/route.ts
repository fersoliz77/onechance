import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { requireAdmin } from '../_lib'
import type { Conversation, ConversationStatus } from '@/types/conversations'

const VALID_STATUSES: ConversationStatus[] = ['pending', 'approved', 'rejected', 'archived']

export async function GET(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(req.url)
  const statusParam = searchParams.get('status') as ConversationStatus | null

  const db = getAdminDb()
  let q: FirebaseFirestore.Query = db.collection('conversations')

  if (statusParam && VALID_STATUSES.includes(statusParam)) {
    q = q.where('status', '==', statusParam)
  }

  const snap = await q.get()

  const conversations: Conversation[] = snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Conversation))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return NextResponse.json({ conversations })
}
