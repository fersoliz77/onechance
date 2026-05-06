import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { requireAdmin, writeAuditLog, parseBody, FeaturedSchema } from '../_lib'

export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const body = parseBody(FeaturedSchema, await req.json())
  if (!body.ok) return body.response

  const { uid, isFeatured } = body.data
  await getAdminDb().collection('players').doc(uid).set({ isFeatured }, { merge: true })
  await writeAuditLog({
    actorUid: auth.decoded.uid,
    actorEmail: auth.decoded.email,
    action: 'featured.set',
    targetCollection: 'players',
    targetUid: uid,
    metadata: { isFeatured },
  })

  return NextResponse.json({ ok: true })
}
