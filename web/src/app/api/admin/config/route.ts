import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, writeAuditLog } from '../_lib'
import { getAdminDb } from '@/lib/firebase-admin'
import { z } from 'zod'

const CONFIG_COL = 'config'
const CONFIG_DOC = 'platform'

const ConfigSchema = z.object({
  general: z.object({
    siteName: z.string().min(1).max(80),
    maintenanceMode: z.boolean(),
    registrationEnabled: z.boolean(),
  }).optional(),
  content: z.object({
    autoApproveProfiles: z.boolean(),
    maxVideosPerPlayer: z.number().int().min(1).max(50),
    maxFeaturedPlayers: z.number().int().min(0).max(200),
    requireEmailVerification: z.boolean(),
  }).optional(),
  notifications: z.object({
    adminEmail: z.string().email().or(z.literal('')),
    newRequestAlerts: z.boolean(),
    weeklySummary: z.boolean(),
  }).optional(),
  features: z.object({
    subscriptionsEnabled: z.boolean(),
    messagingEnabled: z.boolean(),
    ambassadorsEnabled: z.boolean(),
  }).optional(),
})

export type PlatformConfig = z.infer<typeof ConfigSchema> & {
  general: NonNullable<z.infer<typeof ConfigSchema>['general']>
  content: NonNullable<z.infer<typeof ConfigSchema>['content']>
  notifications: NonNullable<z.infer<typeof ConfigSchema>['notifications']>
  features: NonNullable<z.infer<typeof ConfigSchema>['features']>
}

export const DEFAULT_CONFIG: PlatformConfig = {
  general:       { siteName: 'OneChance', maintenanceMode: false, registrationEnabled: true },
  content:       { autoApproveProfiles: false, maxVideosPerPlayer: 5, maxFeaturedPlayers: 10, requireEmailVerification: false },
  notifications: { adminEmail: '', newRequestAlerts: true, weeklySummary: false },
  features:      { subscriptionsEnabled: false, messagingEnabled: false, ambassadorsEnabled: false },
}

export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req)
  if (!auth.ok) return auth.response

  const snap = await getAdminDb().collection(CONFIG_COL).doc(CONFIG_DOC).get()
  const stored = snap.exists ? (snap.data() as Partial<PlatformConfig>) : {}

  return NextResponse.json({
    general:       { ...DEFAULT_CONFIG.general,       ...(stored.general ?? {}) },
    content:       { ...DEFAULT_CONFIG.content,       ...(stored.content ?? {}) },
    notifications: { ...DEFAULT_CONFIG.notifications, ...(stored.notifications ?? {}) },
    features:      { ...DEFAULT_CONFIG.features,      ...(stored.features ?? {}) },
  } satisfies PlatformConfig)
}

export async function POST(req: NextRequest) {
  const auth = await requireSuperAdmin(req)
  if (!auth.ok) return auth.response

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = ConfigSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const update = { ...parsed.data, updatedAt: new Date().toISOString(), updatedBy: auth.decoded.uid }
  await getAdminDb().collection(CONFIG_COL).doc(CONFIG_DOC).set(update, { merge: true })

  await writeAuditLog({
    actorUid:         auth.decoded.uid,
    actorEmail:       auth.decoded.email ?? undefined,
    action:           'update_config',
    targetCollection: CONFIG_COL,
    targetUid:        CONFIG_DOC,
    metadata:         parsed.data as Record<string, unknown>,
  })

  return NextResponse.json({ ok: true })
}
