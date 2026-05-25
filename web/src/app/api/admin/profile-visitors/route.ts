import { NextResponse } from 'next/server'
import { getAdminRtdb } from '@/lib/firebase-admin'
import { requireAdmin } from '../_lib'

type Visitor = {
  uid?: string
  email?: string | null
  name?: string | null
  role?: string | null
  systemRole?: string | null
  count?: number
  lastVisitedAt?: string
}

export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const body = (await req.json().catch(() => ({}))) as { profileUid?: string }
    const profileUid = typeof body.profileUid === 'string' ? body.profileUid.trim() : ''
    if (!profileUid) return NextResponse.json({ error: 'Invalid profileUid' }, { status: 400 })

    const snap = await getAdminRtdb().ref(`profileVisitors/${profileUid}`).get()
    if (!snap.exists()) return NextResponse.json({ items: [] })

    const raw = snap.val() as Record<string, Visitor>
    const items = Object.entries(raw)
      .map(([uid, value]) => ({
        uid,
        name: typeof value?.name === 'string' ? value.name : null,
        email: typeof value?.email === 'string' ? value.email : null,
        role: typeof value?.role === 'string' ? value.role : null,
        systemRole: typeof value?.systemRole === 'string' ? value.systemRole : 'user',
        count: typeof value?.count === 'number' ? value.count : 0,
        lastVisitedAt: typeof value?.lastVisitedAt === 'string' ? value.lastVisitedAt : null,
      }))
      .sort((a, b) => {
        if ((b.count ?? 0) !== (a.count ?? 0)) return (b.count ?? 0) - (a.count ?? 0)
        return (b.lastVisitedAt ?? '').localeCompare(a.lastVisitedAt ?? '')
      })

    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ error: 'Failed to load profile visitors' }, { status: 500 })
  }
}
