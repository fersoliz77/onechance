import { NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb, getAdminRtdb } from '@/lib/firebase-admin'

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { profileUid?: string }
    const profileUid = typeof body.profileUid === 'string' ? body.profileUid.trim() : ''

    if (!profileUid) {
      return NextResponse.json({ error: 'Invalid profileUid' }, { status: 400 })
    }

    const authHeader = req.headers.get('authorization')
    const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : ''

    let viewer: null | {
      uid: string
      email?: string | null
      name?: string | null
      role?: string | null
      systemRole?: string | null
    } = null

    if (bearer) {
      try {
        const decoded = await getAdminAuth().verifyIdToken(bearer)
        if (decoded.uid !== profileUid) {
          const userSnap = await getAdminDb().collection('users').doc(decoded.uid).get()
          const data = userSnap.exists ? userSnap.data() : undefined
          viewer = {
            uid: decoded.uid,
            email: decoded.email ?? null,
            name: typeof data?.name === 'string' ? data.name : null,
            role: typeof data?.role === 'string' ? data.role : null,
            systemRole: typeof data?.systemRole === 'string' ? data.systemRole : 'user',
          }
        }
      } catch {
        viewer = null
      }
    }

    const metricsRef = getAdminRtdb().ref(`profileMetrics/${profileUid}`)
    await metricsRef.transaction((current) => {
      const base = current && typeof current === 'object' ? current as Record<string, unknown> : {}
      const total = typeof base.visits === 'number' ? base.visits : 0
      const internal = typeof base.visitsInternal === 'number' ? base.visitsInternal : 0
      const external = typeof base.visitsExternal === 'number' ? base.visitsExternal : 0
      return {
        ...base,
        visits: total + 1,
        visitsInternal: internal + (viewer ? 1 : 0),
        visitsExternal: external + (viewer ? 0 : 1),
        lastVisitedAt: new Date().toISOString(),
      }
    })

    if (viewer) {
      const visitorRef = getAdminRtdb().ref(`profileVisitors/${profileUid}/${viewer.uid}`)
      await visitorRef.transaction((current) => {
        const base = current && typeof current === 'object' ? current as Record<string, unknown> : {}
        const count = typeof base.count === 'number' ? base.count : 0
        return {
          uid: viewer.uid,
          email: viewer.email ?? null,
          name: viewer.name ?? null,
          role: viewer.role ?? null,
          systemRole: viewer.systemRole ?? 'user',
          count: count + 1,
          lastVisitedAt: new Date().toISOString(),
        }
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to register visit' }, { status: 500 })
  }
}
