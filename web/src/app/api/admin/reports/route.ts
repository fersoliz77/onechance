import { NextResponse } from 'next/server'
import { requireAdmin } from '@/app/api/admin/_lib'
import { getAdminDb } from '@/lib/firebase-admin'

export async function GET(req: Request) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const db = getAdminDb()
  const snap = await db.collection('profile_reports').orderBy('createdAt', 'desc').limit(250).get()
  const items = snap.docs.map((d) => d.data())
  return NextResponse.json({ items })
}
