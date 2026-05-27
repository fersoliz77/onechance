import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/app/api/admin/_lib'
import { getAdminDb } from '@/lib/firebase-admin'

const UpdateReportSchema = z.object({
  action: z.enum(['resolve', 'dismiss']),
  note: z.string().trim().max(500).optional(),
})

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Missing report id' }, { status: 400 })

  const body = await req.json().catch(() => null)
  const parsed = UpdateReportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Payload inválido', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const db = getAdminDb()
  const ref = db.collection('profile_reports').doc(id)
  const snap = await ref.get()
  if (!snap.exists) return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 })

  const now = new Date().toISOString()
  const status = parsed.data.action === 'resolve' ? 'resolved' : 'dismissed'
  await ref.update({
    status,
    adminUid: auth.decoded.uid,
    adminEmail: auth.decoded.email ?? null,
    adminNote: parsed.data.note ?? null,
    updatedAt: now,
    resolvedAt: now,
  })

  return NextResponse.json({ ok: true })
}
