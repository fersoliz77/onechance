import { NextResponse } from 'next/server'
import { getAdminRtdb } from '@/lib/firebase-admin'
import { requireAdmin } from '../_lib'

type DailyEntry = {
  total?: number
  internal?: number
  external?: number
}

function lastUtcDateKeys(days: number) {
  const keys: string[] = []
  const now = new Date()
  for (let i = 0; i < days; i += 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i))
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
    keys.push(key)
  }
  return keys
}

export async function GET(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const url = new URL(req.url)
    const daysParam = Number(url.searchParams.get('days') ?? 7)
    const days = daysParam === 14 || daysParam === 30 ? daysParam : 7
    const keys = lastUtcDateKeys(days)
    const bucket = new Map<string, { uid: string; total: number; internal: number; external: number }>()

    await Promise.all(keys.map(async (key) => {
      const snap = await getAdminRtdb().ref(`profileVisitsDaily/${key}`).get()
      if (!snap.exists()) return
      const daily = snap.val() as Record<string, DailyEntry>
      for (const [uid, value] of Object.entries(daily)) {
        const base = bucket.get(uid) ?? { uid, total: 0, internal: 0, external: 0 }
        base.total += typeof value?.total === 'number' ? value.total : 0
        base.internal += typeof value?.internal === 'number' ? value.internal : 0
        base.external += typeof value?.external === 'number' ? value.external : 0
        bucket.set(uid, base)
      }
    }))

    const items = Array.from(bucket.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    return NextResponse.json({ items, days })
  } catch {
    return NextResponse.json({ error: 'Failed to load top profile visits (7d)' }, { status: 500 })
  }
}
