import { NextResponse } from 'next/server'
import { getAdminRtdb } from '@/lib/firebase-admin'
import { requireAdmin, writeAuditLog, parseBody, VideoActionSchema } from '../_lib'

export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const body = parseBody(VideoActionSchema, await req.json())
  if (!body.ok) return body.response

  const { playerUid, videoId, action, status } = body.data
  const rtdb = getAdminRtdb()
  const baseRef = rtdb.ref(`videos/${playerUid}/${videoId}`)

  if (action === 'toggle') {
    if (!status) return NextResponse.json({ error: 'status required for toggle' }, { status: 400 })
    await baseRef.update({ status })
    await writeAuditLog({
      actorUid: auth.decoded.uid,
      actorEmail: auth.decoded.email,
      action: 'content.video.moderate',
      targetCollection: 'videos',
      targetUid: `${playerUid}/${videoId}`,
      metadata: { status },
    })
    return NextResponse.json({ ok: true })
  }

  if (action === 'delete') {
    await baseRef.remove()
    await writeAuditLog({
      actorUid: auth.decoded.uid,
      actorEmail: auth.decoded.email,
      action: 'content.video.delete',
      targetCollection: 'videos',
      targetUid: `${playerUid}/${videoId}`,
    })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
