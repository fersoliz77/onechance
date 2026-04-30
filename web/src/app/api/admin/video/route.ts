import { NextResponse } from 'next/server'
import { getAdminRtdb } from '@/lib/firebase-admin'
import { requireAdmin, writeAuditLog } from '../_lib'

export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const { playerUid, videoId, action, status } = await req.json()
  if (!playerUid || !videoId || !action) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const rtdb = getAdminRtdb()
  const baseRef = rtdb.ref(`videos/${playerUid}/${videoId}`)

  if (action === 'toggle') {
    if (status !== 'active' && status !== 'hidden') return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
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
