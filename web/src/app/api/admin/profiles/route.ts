import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { requireAdmin } from '../_lib'

async function readCollection(name: 'players' | 'coaches' | 'clubs' | 'agents') {
  const snap = await getAdminDb().collection(name).get()
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }))
}

export async function GET(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  try {
    const [players, coaches, clubs, agents] = await Promise.all([
      readCollection('players'),
      readCollection('coaches'),
      readCollection('clubs'),
      readCollection('agents'),
    ])

    return NextResponse.json({ players, coaches, clubs, agents })
  } catch {
    return NextResponse.json({ error: 'Failed to load admin profiles' }, { status: 500 })
  }
}
