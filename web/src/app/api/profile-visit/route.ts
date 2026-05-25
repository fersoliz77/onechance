import { NextResponse } from 'next/server'
import { getAdminRtdb } from '@/lib/firebase-admin'

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { profileUid?: string }
    const profileUid = typeof body.profileUid === 'string' ? body.profileUid.trim() : ''

    if (!profileUid) {
      return NextResponse.json({ error: 'Invalid profileUid' }, { status: 400 })
    }

    const visitsRef = getAdminRtdb().ref(`profileMetrics/${profileUid}/visits`)
    await visitsRef.transaction((current) => {
      const value = typeof current === 'number' ? current : 0
      return value + 1
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to register visit' }, { status: 500 })
  }
}
