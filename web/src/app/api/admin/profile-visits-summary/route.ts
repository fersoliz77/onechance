import { NextResponse } from 'next/server'
import { getAdminRtdb } from '@/lib/firebase-admin'
import { requireAdmin } from '../_lib'

type Metrics = {
  visits?: number
  visitsInternal?: number
  visitsExternal?: number
  lastVisitedAt?: string
}

export async function GET(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const snap = await getAdminRtdb().ref('profileMetrics').get()
    if (!snap.exists()) return NextResponse.json({ items: [] })

    const raw = snap.val() as Record<string, Metrics>
    const items = Object.entries(raw).map(([uid, value]) => ({
      uid,
      visits: typeof value?.visits === 'number' ? value.visits : 0,
      visitsInternal: typeof value?.visitsInternal === 'number' ? value.visitsInternal : 0,
      visitsExternal: typeof value?.visitsExternal === 'number' ? value.visitsExternal : 0,
      lastVisitedAt: typeof value?.lastVisitedAt === 'string' ? value.lastVisitedAt : null,
    }))

    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ error: 'Failed to load profile metrics' }, { status: 500 })
  }
}
