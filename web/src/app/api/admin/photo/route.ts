import { NextResponse } from 'next/server'
import { getAdminRtdb } from '@/lib/firebase-admin'
import { requireAdmin, writeAuditLog, parseBody, PhotoActionSchema } from '../_lib'

type PhotoNode = {
  url: string
  storagePath: string
  status: 'hidden' | 'pending' | 'published'
  createdAt: string
}

export async function GET(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const snap = await getAdminRtdb().ref('photos').get()
    if (!snap.exists()) return NextResponse.json({ items: [] })

    const all = snap.val() as Record<string, Record<string, PhotoNode & { status?: PhotoNode['status'] }>>
    const items: Array<PhotoNode & { id: string; playerUid: string }> = []

    for (const [playerUid, photos] of Object.entries(all)) {
      for (const [id, value] of Object.entries(photos ?? {})) {
        items.push({ id, playerUid, ...value, status: value.status ?? 'published' })
      }
    }

    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ error: 'Failed to load photos' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const body = parseBody(PhotoActionSchema, await req.json())
  if (!body.ok) return body.response

  const { playerUid, photoId, action, status } = body.data
  const rtdb = getAdminRtdb()
  const baseRef = rtdb.ref(`photos/${playerUid}/${photoId}`)

  if (action === 'toggle') {
    if (!status) return NextResponse.json({ error: 'status required for toggle' }, { status: 400 })
    await baseRef.update({ status })
    await writeAuditLog({
      actorUid: auth.decoded.uid,
      actorEmail: auth.decoded.email,
      action: 'content.photo.moderate',
      targetCollection: 'photos',
      targetUid: `${playerUid}/${photoId}`,
      metadata: { status },
    })
    return NextResponse.json({ ok: true })
  }

  if (action === 'delete') {
    await baseRef.remove()
    await writeAuditLog({
      actorUid: auth.decoded.uid,
      actorEmail: auth.decoded.email,
      action: 'content.photo.delete',
      targetCollection: 'photos',
      targetUid: `${playerUid}/${photoId}`,
    })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
