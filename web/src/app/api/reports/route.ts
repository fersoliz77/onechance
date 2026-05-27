import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/app/api/messages/_lib'
import { getAdminDb } from '@/lib/firebase-admin'

const CreateReportSchema = z.object({
  targetUid: z.string().min(1),
  targetRole: z.enum(['player', 'coach', 'club', 'agent']),
  reason: z.string().trim().min(10).max(1500),
  sourcePath: z.string().trim().max(300).optional(),
})

export async function POST(req: Request) {
  const auth = await requireUser(req)
  if (!auth.ok) return auth.response

  const body = await req.json().catch(() => null)
  const parsed = CreateReportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Payload inválido', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { targetUid, targetRole, reason, sourcePath } = parsed.data
  if (targetUid === auth.decoded.uid) {
    return NextResponse.json({ error: 'No podés reportar tu propio perfil.' }, { status: 400 })
  }

  const db = getAdminDb()
  const now = new Date().toISOString()
  const reportRef = db.collection('profile_reports').doc()

  await reportRef.set({
    id: reportRef.id,
    targetUid,
    targetRole,
    reason,
    sourcePath: sourcePath ?? null,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    reporterUid: auth.decoded.uid,
    reporterName: (auth.userData?.name as string | undefined) ?? null,
    reporterEmail: (auth.userData?.email as string | undefined) ?? auth.decoded.email ?? null,
  })

  return NextResponse.json({ ok: true, id: reportRef.id })
}
