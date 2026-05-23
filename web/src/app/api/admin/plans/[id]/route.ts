import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin, writeAuditLog } from '../../_lib'
import { getAdminDb } from '@/lib/firebase-admin'

const PatchSchema = z.object({
  name:          z.string().min(1).max(80).optional(),
  role:          z.enum(['player', 'coach', 'club', 'agent']).optional(),
  price:         z.number().min(0).max(1_000_000).optional(),
  currency:      z.enum(['USD', 'ARS']).optional(),
  interval:      z.enum(['monthly', 'yearly']).optional(),
  features:      z.array(z.string().min(1).max(120)).max(20).optional(),
  isActive:      z.boolean().optional(),
  isFeatured:    z.boolean().optional(),
  order:         z.number().int().min(0).optional(),
  stripePriceId: z.string().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const { id } = await params

  let body: z.infer<typeof PatchSchema>
  try { body = PatchSchema.parse(await req.json()) }
  catch (e) {
    return NextResponse.json({ error: 'Datos inválidos', detail: String(e) }, { status: 400 })
  }

  if (Object.keys(body).length === 0) {
    return NextResponse.json({ error: 'Sin cambios' }, { status: 400 })
  }

  const db  = getAdminDb()
  const ref = db.collection('subscription_plans').doc(id)
  const doc = await ref.get()
  if (!doc.exists) return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })

  await ref.update({ ...body, updatedAt: new Date().toISOString() })

  await writeAuditLog({
    actorUid:   auth.decoded.uid,
    actorEmail: auth.decoded.email,
    action:     'plan_update',
    metadata:   { planId: id, fields: Object.keys(body) },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const { id } = await params
  const db  = getAdminDb()
  const ref = db.collection('subscription_plans').doc(id)
  const doc = await ref.get()
  if (!doc.exists) return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })

  await ref.delete()

  await writeAuditLog({
    actorUid:   auth.decoded.uid,
    actorEmail: auth.decoded.email,
    action:     'plan_delete',
    metadata:   { planId: id },
  })

  return NextResponse.json({ ok: true })
}
