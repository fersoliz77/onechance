'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { collection, query, where, onSnapshot, type Query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import type { Conversation, ConversationStatus } from '@/types/conversations'
import type { Role } from '@/types'

// ── Helpers ────────────────────────────────────────────────────────────────────

const ROLE_META: Record<Role, { label: string; color: string; bg: string }> = {
  player: { label: 'Jugador',       color: '#AAFF00', bg: 'rgba(170,255,0,0.1)'  },
  coach:  { label: 'Técnico',       color: '#22D3EE', bg: 'rgba(34,211,238,0.1)' },
  club:   { label: 'Club',          color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  agent:  { label: 'Representante', color: '#7B3FF6', bg: 'rgba(123,63,246,0.1)' },
}

const STATUS_META: Record<ConversationStatus, { label: string; color: string; dot: string }> = {
  pending:  { label: 'Pendiente', color: '#FFB400', dot: 'bg-[#FFB400]'                      },
  approved: { label: 'Aprobada',  color: '#00C853', dot: 'bg-[#00C853]'                      },
  rejected: { label: 'Rechazada', color: '#FF3C3C', dot: 'bg-[#FF3C3C]'                      },
  archived: { label: 'Archivada', color: 'rgba(255,255,255,0.3)', dot: 'bg-[rgba(255,255,255,0.25)]' },
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60)    return 'Hace menos de 1 min'
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`
  return `Hace ${Math.floor(diff / 86400)} días`
}

function RoleBadge({ role }: { role: string }) {
  const meta = ROLE_META[role as Role] ?? { label: role, color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.06)' }
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ color: meta.color, background: meta.bg }}>
      {meta.label}
    </span>
  )
}

// ── Reject modal ───────────────────────────────────────────────────────────────

interface RejectModalProps {
  conv:      Conversation
  onConfirm: (reason: string) => void
  onCancel:  () => void
  loading:   boolean
}

function RejectModal({ conv, onConfirm, onCancel, loading }: RejectModalProps) {
  const [reason, setReason] = useState('')
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-[1] w-full max-w-[420px] rounded-2xl border border-[rgba(255,60,60,0.25)] bg-[rgba(10,10,10,0.96)] p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="absolute left-3 right-3 top-0 h-[2px] bg-[linear-gradient(90deg,transparent,#FF3C3C,transparent)]" />
        <h3 className="text-[16px] font-semibold text-white mb-1">Rechazar conversación</h3>
        <p className="text-[12px] text-[rgba(255,255,255,0.4)] mb-4">
          De <span className="text-white font-medium">{conv.fromName}</span> → <span className="text-white font-medium">{conv.toName}</span>.
          Esta nota es solo visible para admins.
        </p>
        <label className="block text-[11px] uppercase tracking-[0.07em] text-[rgba(255,255,255,0.35)] mb-1.5">
          Motivo interno (opcional)
        </label>
        <textarea value={reason} onChange={e => setReason(e.target.value)} maxLength={500} rows={3}
          placeholder="Ej: Contenido inapropiado, spam…"
          className="w-full resize-none rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-3 py-2.5 text-[13px] text-white placeholder-[rgba(255,255,255,0.2)] outline-none focus:border-[rgba(255,60,60,0.5)] transition-colors"
        />
        <div className="mt-0.5 text-right text-[11px] text-[rgba(255,255,255,0.2)]">{reason.length}/500</div>
        <div className="mt-4 flex gap-2.5">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 h-[38px] rounded-lg border border-[rgba(255,255,255,0.12)] text-[13px] text-[rgba(255,255,255,0.6)] hover:text-white transition-colors cursor-pointer bg-transparent">
            Cancelar
          </button>
          <button onClick={() => onConfirm(reason)} disabled={loading}
            className="flex-1 h-[38px] rounded-lg bg-[#FF3C3C] text-[13px] font-semibold text-white hover:bg-[#e53535] transition-colors cursor-pointer border-none disabled:opacity-60">
            {loading ? 'Rechazando…' : 'Confirmar rechazo'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Message preview drawer ─────────────────────────────────────────────────────

interface DrawerProps {
  conv:          Conversation
  onClose:       () => void
  onApprove:     () => void
  onReject:      () => void
  onUnblock:     () => void
  actionLoading: boolean
}

function MessageDrawer({ conv, onClose, onApprove, onReject, onUnblock, actionLoading }: DrawerProps) {
  const s = STATUS_META[conv.status]
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-[1] w-full max-w-[580px] max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(10,12,10,0.97)] shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] bg-[rgba(10,12,10,0.97)] px-5 py-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              <span className="text-[12px] font-medium" style={{ color: s.color }}>{s.label}</span>
            </div>
            <h3 className="text-[15px] font-semibold text-white leading-tight">{conv.subject}</h3>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[rgba(255,255,255,0.4)] hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-all cursor-pointer bg-transparent border-none">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Participants */}
        <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-[0.07em] text-[rgba(255,255,255,0.3)] mb-1">Remitente</p>
            <p className="text-[14px] font-medium text-white truncate">{conv.fromName}</p>
            <RoleBadge role={conv.fromRole} />
          </div>
          <svg className="w-5 h-5 shrink-0 text-[rgba(255,255,255,0.2)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          <div className="flex-1 min-w-0 text-right">
            <p className="text-[11px] uppercase tracking-[0.07em] text-[rgba(255,255,255,0.3)] mb-1">Destinatario</p>
            <p className="text-[14px] font-medium text-white truncate">{conv.toName}</p>
            <RoleBadge role={conv.toRole} />
          </div>
        </div>

        {/* Messages */}
        <div className="px-5 py-4 space-y-3">
          <p className="text-[11px] uppercase tracking-[0.07em] text-[rgba(255,255,255,0.3)]">
            {conv.messages.length} mensaje{conv.messages.length !== 1 ? 's' : ''} en cola
          </p>
          {conv.messages.map((msg, i) => (
            <div key={msg.id} className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-[rgba(255,255,255,0.35)]">Mensaje #{i + 1}</span>
                <span className="text-[11px] text-[rgba(255,255,255,0.25)]">{new Date(msg.sentAt).toLocaleString('es-AR')}</span>
              </div>
              <p className="text-[14px] text-[rgba(255,255,255,0.85)] leading-relaxed whitespace-pre-wrap">{msg.body}</p>
            </div>
          ))}
        </div>

        {conv.rejectionReason && (
          <div className="mx-5 mb-4 rounded-lg border border-[rgba(255,60,60,0.2)] bg-[rgba(255,60,60,0.06)] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.07em] text-[rgba(255,60,60,0.6)] mb-1">Motivo de rechazo</p>
            <p className="text-[13px] text-[rgba(255,255,255,0.6)]">{conv.rejectionReason}</p>
          </div>
        )}

        {/* Actions */}
        {conv.status === 'pending' && (
          <div className="sticky bottom-0 border-t border-[rgba(255,255,255,0.08)] bg-[rgba(10,12,10,0.97)] px-5 py-4 flex gap-2.5">
            <button onClick={onReject} disabled={actionLoading}
              className="flex-1 h-[40px] rounded-xl border border-[rgba(255,60,60,0.3)] text-[13px] font-medium text-[#FF6060] hover:bg-[rgba(255,60,60,0.08)] transition-colors cursor-pointer bg-transparent disabled:opacity-50">
              Rechazar
            </button>
            <button onClick={onApprove} disabled={actionLoading}
              className="flex-1 h-[40px] rounded-xl bg-[#00C853] text-[13px] font-semibold text-[#0A0A0A] hover:bg-[#00b34a] transition-colors cursor-pointer border-none disabled:opacity-50">
              {actionLoading ? 'Procesando…' : `Aprobar (${conv.messages.length} msg)`}
            </button>
          </div>
        )}
        {conv.status === 'rejected' && (
          <div className="sticky bottom-0 border-t border-[rgba(255,255,255,0.08)] bg-[rgba(10,12,10,0.97)] px-5 py-4">
            <button onClick={onUnblock} disabled={actionLoading}
              className="w-full h-[40px] rounded-xl border border-[rgba(255,180,0,0.3)] text-[13px] font-medium text-[#FFB400] hover:bg-[rgba(255,180,0,0.08)] transition-colors cursor-pointer bg-transparent disabled:opacity-50">
              {actionLoading ? 'Procesando…' : 'Desbloquear — permitir nuevo intento'}
            </button>
          </div>
        )}

        <div className="px-5 pb-5 pt-1">
          <p className="text-[11px] text-[rgba(255,255,255,0.2)]">
            Iniciada {timeAgo(conv.createdAt)} · ID: <span className="font-mono">{conv.id.slice(0, 12)}…</span>
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

type FilterStatus = 'pending' | 'approved' | 'rejected' | 'all'

interface Props {
  onPendingCountChange?: (count: number) => void
}

export default function AdminMessagesTab({ onPendingCountChange }: Props) {
  const { firebaseUser } = useAuth()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading]             = useState(true)
  const [filter, setFilter]               = useState<FilterStatus>('pending')
  const [selected, setSelected]           = useState<Conversation | null>(null)
  const [rejectTarget, setRejectTarget]   = useState<Conversation | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast]                 = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Realtime Firestore listener — swaps query when filter changes ─────────────

  const unsubRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    // Unsubscribe previous listener before creating a new one
    unsubRef.current?.()

    const loadingTimer = window.setTimeout(() => setLoading(true), 0)

    const col = collection(db, 'conversations')
    let q: Query

    if (filter === 'all') {
      q = query(col)
    } else {
      q = query(col, where('status', '==', filter))
    }

    const unsub = onSnapshot(
      q,
      snap => {
        const list = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as Conversation))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

        setConversations(list)

        // Badge count is always based on pending, regardless of current filter
        const pendingCount = filter === 'pending'
          ? list.filter(c => c.status === 'pending').length
          : list.length // for other filters we don't update the pending badge

        if (filter === 'pending' || filter === 'all') {
          onPendingCountChange?.(
            filter === 'all'
              ? list.filter(c => c.status === 'pending').length
              : pendingCount,
          )
        }

        setLoading(false)
      },
      err => {
        console.error('[AdminMessages] onSnapshot error:', err)
        setLoading(false)
      },
    )

    unsubRef.current = unsub
    return () => {
      window.clearTimeout(loadingTimer)
      unsub()
    }
  }, [filter, onPendingCountChange])

  // ── API call helper (for actions only — reads come from onSnapshot) ───────────

  const apiCall = useCallback(async (path: string, body?: Record<string, unknown>) => {
    if (!firebaseUser) throw new Error('No auth')
    let token = await firebaseUser.getIdToken()
    let res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body ?? {}),
    })
    if (res.status === 401) {
      token = await firebaseUser.getIdToken(true)
      res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body ?? {}),
      })
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`)
    }
    return res.json()
  }, [firebaseUser])

  // ── Actions (onSnapshot updates the list automatically after each one) ────────

  const handleApprove = async (conv: Conversation) => {
    setActionLoading(true)
    try {
      await apiCall(`/api/admin/messages/${conv.id}/approve`)
      showToast(`Conversación aprobada — ${conv.messages.length} mensaje(s) entregado(s) a ${conv.toName}.`)
      setSelected(null)
    } catch (err) {
      showToast(`Error al aprobar: ${(err as Error).message}`, false)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (conv: Conversation, reason: string) => {
    setActionLoading(true)
    try {
      await apiCall(`/api/admin/messages/${conv.id}/reject`, { reason })
      showToast(`Conversación rechazada. ${conv.fromName} no será notificado.`)
      setRejectTarget(null)
      setSelected(null)
    } catch (err) {
      showToast(`Error al rechazar: ${(err as Error).message}`, false)
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnblock = async (conv: Conversation) => {
    setActionLoading(true)
    try {
      await apiCall(`/api/admin/messages/${conv.id}/unblock`)
      showToast(`Bloqueo levantado. ${conv.fromName} puede iniciar una nueva conversación.`)
      setSelected(null)
    } catch (err) {
      showToast(`Error al desbloquear: ${(err as Error).message}`, false)
    } finally {
      setActionLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const pendingCount = conversations.filter(c => c.status === 'pending').length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <h2 className="text-xl font-semibold text-white tracking-tight">Mensajes</h2>
          <span className="flex items-center gap-1.5 text-[11px] text-[#AAFF00]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#AAFF00] animate-pulse" />
            en tiempo real
          </span>
        </div>
        <p className="text-sm text-[rgba(255,255,255,0.35)]">
          Los usuarios no saben que existe esta moderación.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {([
          { id: 'pending',  label: 'Pendientes', count: pendingCount },
          { id: 'approved', label: 'Aprobadas',  count: null },
          { id: 'rejected', label: 'Rechazadas', count: null },
          { id: 'all',      label: 'Todas',      count: null },
        ] as { id: FilterStatus; label: string; count: number | null }[]).map(f => {
          const active = filter === f.id
          return (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className="h-[34px] px-3.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer border flex items-center gap-2"
              style={{
                background:  active ? 'rgba(170,255,0,0.10)' : 'transparent',
                color:       active ? '#AAFF00' : 'rgba(255,255,255,0.45)',
                borderColor: active ? 'rgba(170,255,0,0.22)' : 'rgba(255,255,255,0.1)',
              }}>
              {f.label}
              {f.count !== null && f.count > 0 && (
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-[#AAFF00] text-black min-w-[20px] text-center">
                  {f.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.07)]">
                {['Remitente', 'Destinatario', 'Asunto', 'Msgs', 'Estado', 'Hace', ''].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[rgba(255,255,255,0.3)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!loading && conversations.map(conv => {
                const sm = STATUS_META[conv.status]
                return (
                  <tr key={conv.id} onClick={() => setSelected(conv)}
                    className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.03)] cursor-pointer transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className="text-white font-medium text-[13px]">{conv.fromName}</span>
                        <RoleBadge role={conv.fromRole} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className="text-white font-medium text-[13px]">{conv.toName}</span>
                        <RoleBadge role={conv.toRole} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 max-w-[200px]">
                      <p className="text-[rgba(255,255,255,0.8)] text-[13px] truncate">{conv.subject}</p>
                      <p className="text-[11px] text-[rgba(255,255,255,0.3)] truncate mt-0.5">
                        {conv.messages[0]?.body.slice(0, 60)}…
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-white font-semibold">{conv.messageCount}</span>
                      <span className="text-[rgba(255,255,255,0.3)] text-[11px]">/3</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
                        <span className="text-[12px] font-medium" style={{ color: sm.color }}>{sm.label}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[rgba(255,255,255,0.35)] text-[12px] whitespace-nowrap">
                      {timeAgo(conv.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      {conv.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={e => { e.stopPropagation(); handleApprove(conv) }} disabled={actionLoading}
                            className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[rgba(0,200,83,0.12)] text-[#00C853] border border-[rgba(0,200,83,0.3)] hover:bg-[rgba(0,200,83,0.2)] transition-colors cursor-pointer disabled:opacity-50">
                            Aprobar
                          </button>
                          <button onClick={e => { e.stopPropagation(); setRejectTarget(conv) }} disabled={actionLoading}
                            className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[rgba(255,60,60,0.1)] text-[#FF6060] border border-[rgba(255,60,60,0.25)] hover:bg-[rgba(255,60,60,0.18)] transition-colors cursor-pointer disabled:opacity-50">
                            Rechazar
                          </button>
                        </div>
                      )}
                      {conv.status === 'rejected' && (
                        <button onClick={e => { e.stopPropagation(); handleUnblock(conv) }} disabled={actionLoading}
                          className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[rgba(255,180,0,0.1)] text-[#FFB400] border border-[rgba(255,180,0,0.25)] hover:bg-[rgba(255,180,0,0.18)] transition-colors cursor-pointer disabled:opacity-50">
                          Desbloquear
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="py-14 text-center text-[rgba(255,255,255,0.3)] text-sm">Cargando conversaciones…</div>
        )}
        {!loading && conversations.length === 0 && (
          <div className="py-14 flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center">
              <svg className="w-5 h-5 text-[rgba(255,255,255,0.2)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p className="text-[rgba(255,255,255,0.25)] text-sm">
              {filter === 'pending' ? 'Sin conversaciones pendientes.' : 'Sin conversaciones en esta categoría.'}
            </p>
          </div>
        )}
      </div>

      {selected && (
        <MessageDrawer conv={selected} onClose={() => setSelected(null)}
          onApprove={() => handleApprove(selected)}
          onReject={() => { setRejectTarget(selected); setSelected(null) }}
          onUnblock={() => handleUnblock(selected)}
          actionLoading={actionLoading}
        />
      )}

      {rejectTarget && (
        <RejectModal conv={rejectTarget}
          onConfirm={reason => handleReject(rejectTarget, reason)}
          onCancel={() => setRejectTarget(null)}
          loading={actionLoading}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[400] max-w-[380px] rounded-xl border px-4 py-3 shadow-2xl text-[13px] font-medium"
          style={{
            background:  toast.ok ? 'rgba(0,200,83,0.12)' : 'rgba(255,60,60,0.12)',
            borderColor: toast.ok ? 'rgba(0,200,83,0.3)'  : 'rgba(255,60,60,0.3)',
            color:       toast.ok ? '#00C853'               : '#FF6060',
          }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
