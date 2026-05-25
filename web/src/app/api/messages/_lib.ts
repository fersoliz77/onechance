import { NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

export async function requireUser(req: Request) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) {
    return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token)
    const snap = await getAdminDb().collection('users').doc(decoded.uid).get()
    if (!snap.exists) {
      return { ok: false as const, response: NextResponse.json({ error: 'User not found' }, { status: 404 }) }
    }
    return { ok: true as const, decoded, userData: snap.data()! }
  } catch {
    return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
}

export function genId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
}
