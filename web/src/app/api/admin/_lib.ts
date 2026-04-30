import { NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

export async function requireAdmin(req: Request) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const decoded = await getAdminAuth().verifyIdToken(token)
  const snap = await getAdminDb().collection('users').doc(decoded.uid).get()
  const role = snap.exists ? (snap.data()?.systemRole as string | undefined) : undefined
  if (role !== 'admin' && role !== 'super_admin') {
    return { ok: false as const, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { ok: true as const, decoded, role }
}

export async function requireSuperAdmin(req: Request) {
  const base = await requireAdmin(req)
  if (!base.ok) return base
  if (base.role !== 'super_admin') {
    return { ok: false as const, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return base
}

export async function writeAuditLog(params: {
  actorUid: string
  actorEmail?: string
  action: string
  targetCollection?: string
  targetUid?: string
  metadata?: Record<string, unknown>
}) {
  const db = getAdminDb()
  await db.collection('admin_audit_logs').add({
    ...params,
    createdAt: new Date().toISOString(),
  })
}
