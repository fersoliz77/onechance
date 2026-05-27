'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'

type ReportStatus = 'pending' | 'resolved' | 'dismissed'

type ProfileReport = {
  id: string
  targetUid: string
  targetRole: 'player' | 'coach' | 'club' | 'agent'
  reason: string
  sourcePath: string | null
  status: ReportStatus
  createdAt: string
  updatedAt: string
  reporterUid: string
  reporterName: string | null
  reporterEmail: string | null
  adminUid?: string | null
  adminEmail?: string | null
  adminNote?: string | null
  resolvedAt?: string | null
}

const ROLE_LABEL: Record<ProfileReport['targetRole'], string> = {
  player: 'Jugador',
  coach: 'Técnico',
  club: 'Club',
  agent: 'Representante',
}

export default function AdminReportsTab() {
  const { firebaseUser } = useAuth()
  const [items, setItems] = useState<ProfileReport[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ReportStatus | 'all'>('pending')
  const [noteById, setNoteById] = useState<Record<string, string>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!firebaseUser) return
    setLoading(true)
    setError('')
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch('/api/admin/reports', { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('No se pudieron cargar los reportes')
      const body = await res.json() as { items?: ProfileReport[] }
      setItems(Array.isArray(body.items) ? body.items : [])
    } catch (err) {
      console.error('[AdminReports] load failed:', err)
      setItems([])
      setError('No se pudieron cargar los reportes de perfil.')
    } finally {
      setLoading(false)
    }
  }, [firebaseUser])

  useEffect(() => {
    const id = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(id)
  }, [load])

  const visible = useMemo(() => {
    if (filter === 'all') return items
    return items.filter((i) => i.status === filter)
  }, [filter, items])

  const handleAction = async (id: string, action: 'resolve' | 'dismiss') => {
    if (!firebaseUser) return
    setBusyId(id)
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, note: (noteById[id] ?? '').trim() || undefined }),
      })
      if (!res.ok) throw new Error('No se pudo actualizar el reporte')
      await load()
    } catch (err) {
      console.error('[AdminReports] update failed:', err)
      setError('No se pudo actualizar el estado del reporte.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[18px] font-semibold text-white">Reportes de perfiles</h3>
        <div className="flex gap-1.5">
          {(['pending', 'resolved', 'dismissed', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="rounded-lg border px-2.5 py-1 text-[12px] cursor-pointer"
              style={{
                borderColor: filter === f ? 'rgba(170,255,0,0.35)' : 'rgba(255,255,255,0.12)',
                color: filter === f ? '#AAFF00' : 'rgba(255,255,255,0.55)',
                background: filter === f ? 'rgba(170,255,0,0.1)' : 'transparent',
              }}
            >
              {f === 'pending' ? 'Pendientes' : f === 'resolved' ? 'Resueltos' : f === 'dismissed' ? 'Descartados' : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="rounded-lg border border-[rgba(255,180,0,0.35)] bg-[rgba(255,180,0,0.08)] p-3 text-[12px] text-[rgba(255,220,140,0.95)]">{error}</div>}

      <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-[rgba(255,255,255,0.35)]">Cargando reportes…</div>
        ) : visible.length === 0 ? (
          <div className="py-12 text-center text-[rgba(255,255,255,0.3)]">No hay reportes en esta categoría.</div>
        ) : (
          <div className="divide-y divide-[rgba(255,255,255,0.06)]">
            {visible.map((r) => (
              <div key={r.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[12px] text-[rgba(255,255,255,0.35)]">{new Date(r.createdAt).toLocaleString('es-AR')} · {ROLE_LABEL[r.targetRole]} · {r.targetUid}</div>
                    <div className="mt-1 text-white text-[14px]">{r.reason}</div>
                    <div className="mt-1 text-[12px] text-[rgba(255,255,255,0.45)]">Reportado por: {r.reporterName || r.reporterEmail || r.reporterUid}</div>
                    {r.sourcePath && <div className="text-[12px] text-[rgba(255,255,255,0.35)]">Origen: {r.sourcePath}</div>}
                    {r.adminNote && <div className="mt-1 text-[12px] text-[rgba(255,255,255,0.4)]">Nota admin: {r.adminNote}</div>}
                  </div>
                  <div className="text-[11px] px-2 py-1 rounded border" style={{
                    color: r.status === 'pending' ? '#FFB400' : r.status === 'resolved' ? '#00C853' : 'rgba(255,255,255,0.6)',
                    borderColor: r.status === 'pending' ? 'rgba(255,180,0,0.35)' : r.status === 'resolved' ? 'rgba(0,200,83,0.35)' : 'rgba(255,255,255,0.2)',
                    background: r.status === 'pending' ? 'rgba(255,180,0,0.1)' : r.status === 'resolved' ? 'rgba(0,200,83,0.1)' : 'rgba(255,255,255,0.05)',
                  }}>{r.status === 'pending' ? 'Pendiente' : r.status === 'resolved' ? 'Resuelto' : 'Descartado'}</div>
                </div>

                {r.status === 'pending' && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={noteById[r.id] ?? ''}
                      onChange={(e) => setNoteById((prev) => ({ ...prev, [r.id]: e.target.value }))}
                      placeholder="Nota interna (opcional)"
                      className="h-9 flex-1 rounded-lg border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.03)] px-3 text-[12px] text-white outline-none"
                    />
                    <button
                      onClick={() => handleAction(r.id, 'resolve')}
                      disabled={busyId === r.id}
                      className="h-9 rounded-lg border border-[rgba(0,200,83,0.35)] bg-[rgba(0,200,83,0.1)] px-3 text-[12px] font-semibold text-[#00C853] cursor-pointer disabled:opacity-60"
                    >
                      Resolver
                    </button>
                    <button
                      onClick={() => handleAction(r.id, 'dismiss')}
                      disabled={busyId === r.id}
                      className="h-9 rounded-lg border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.04)] px-3 text-[12px] font-semibold text-[rgba(255,255,255,0.7)] cursor-pointer disabled:opacity-60"
                    >
                      Descartar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
