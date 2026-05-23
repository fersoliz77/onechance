import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin, writeAuditLog } from '../_lib'
import { getAdminDb } from '@/lib/firebase-admin'

const PlanSchema = z.object({
  name:          z.string().min(1).max(80),
  role:          z.enum(['player', 'coach', 'club', 'agent']),
  price:         z.number().min(0).max(1_000_000),
  currency:      z.enum(['USD', 'ARS']),
  interval:      z.enum(['monthly', 'yearly']),
  features:      z.array(z.string().min(1).max(120)).max(20),
  isActive:      z.boolean(),
  isFeatured:    z.boolean(),
  order:         z.number().int().min(0),
  stripePriceId: z.string().optional(),
})

// GET — public, used by pricing pages and admin
export async function GET() {
  const db   = getAdminDb()
  const snap = await db.collection('subscription_plans').orderBy('role').orderBy('order').get()
  const plans = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  return NextResponse.json({ plans })
}

// POST — admin only
export async function POST(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  let body: z.infer<typeof PlanSchema>
  try { body = PlanSchema.parse(await req.json()) }
  catch (e) {
    return NextResponse.json({ error: 'Datos inválidos', detail: String(e) }, { status: 400 })
  }

  const now = new Date().toISOString()
  const db  = getAdminDb()
  const ref = await db.collection('subscription_plans').add({ ...body, createdAt: now, updatedAt: now })

  await writeAuditLog({
    actorUid:   auth.decoded.uid,
    actorEmail: auth.decoded.email,
    action:     'plan_create',
    metadata:   { planId: ref.id, name: body.name, role: body.role },
  })

  return NextResponse.json({ id: ref.id })
}
