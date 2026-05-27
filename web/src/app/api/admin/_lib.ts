import { NextResponse } from 'next/server'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'
import { z } from 'zod'

export async function requireAdmin(req: Request) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token)
    const snap = await getAdminDb().collection('users').doc(decoded.uid).get()
    const role = snap.exists ? (snap.data()?.systemRole as string | undefined) : undefined
    if (role !== 'admin' && role !== 'super_admin') {
      return { ok: false as const, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
    }
    return { ok: true as const, decoded, role }
  } catch {
    return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
}

export async function requireSuperAdmin(req: Request) {
  const base = await requireAdmin(req)
  if (!base.ok) return base
  if (base.role !== 'super_admin') {
    return { ok: false as const, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return base
}

export async function requireOwner(req: Request, targetUid: string) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token)
    if (decoded.uid !== targetUid) {
      return { ok: false as const, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
    }
    return { ok: true as const, decoded }
  } catch {
    return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
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

export function parseBody<T>(schema: z.ZodSchema<T>, data: unknown): { ok: true; data: T } | { ok: false; response: NextResponse } {
  const result = schema.safeParse(data)
  if (!result.success) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Invalid payload', details: result.error.flatten().fieldErrors },
        { status: 400 },
      ),
    }
  }
  return { ok: true, data: result.data }
}

// ── Schemas ────────────────────────────────────────────────────
export const ProfileStatusSchema = z.object({
  collection: z.enum(['players', 'coaches', 'clubs', 'agents']),
  uid: z.string().min(1),
  status: z.enum(['draft', 'pending', 'published', 'rejected', 'hidden']),
  rejectionReason: z.string().max(500).optional(),
})

export const FeaturedSchema = z.object({
  uid: z.string().min(1),
  isFeatured: z.boolean(),
})

export const VideoActionSchema = z.object({
  playerUid: z.string().min(1),
  videoId: z.string().min(1),
  action: z.enum(['toggle', 'delete']),
  status: z.enum(['hidden', 'pending', 'published']).optional(),
})

export const PhotoActionSchema = z.object({
  playerUid: z.string().min(1),
  photoId: z.string().min(1),
  action: z.enum(['toggle', 'delete']),
  status: z.enum(['hidden', 'pending', 'published']).optional(),
})

export const SystemRoleSchema = z.object({
  uid: z.string().min(1),
  systemRole: z.enum(['user', 'admin', 'super_admin']),
})
