'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { subscribeMessages, subscribeUserConversations, markMessageRead } from '@/lib/rtdb'
import type { MessageEntry, UserConvMirror } from '@/lib/rtdb'
import type { ConversationSafe, ConversationStatus } from '@/types/conversations'
import type { Role } from '@/types'

// ── Shared helpers ─────────────────────────────────────────────────────────────

const ROLE_META: Record<Role, { label: string; color: string; bg: string }> = {
  player: { label: 'Jugador',       color: '#AAFF00', bg: 'rgba(170,255,0,0.1)'  },
  coach:  { label: 'Técnico',       color: '#22D3EE', bg: 'rgba(34,211,238,0.1)' },
  club:   { label: 'Club',          color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  agent:  { label: 'Representante', color: '#7B3FF6', bg: 'rgba(123,63,246,0.1)' },
}

function RoleBadge({ role }: { role: string }) {
  const meta = ROLE_META[role as Role] ?? { label: role, color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.06)' }
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ color: meta.color, background: meta.bg }}>
      {meta.label}
    </span>
  )
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60)    return 'Hace un momento'
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

// Status visible para el remitente — NUNCA revela que hay moderación
function SentStatusBadge({ status }: { status: ConversationStatus }) {
  if (status === 'approved') {
    return (
      <span className="flex items-center gap-1 text-[11px] text-[#00C853]">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M20 6 9 17l-5-5"/>
        </svg>
        Entregado
      </span>
    )
  }
  // pending | rejected | archived → siempre "Enviado" (el usuario nunca sabe)
  return (
    <span className="flex items-center gap-1 text-[11px] text-[rgba(255,255,255,0.4)]">
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path d="M20 6 9 17l-5-5"/>
      </svg>
      Enviado
    </span>
  )
}

// ── Reply form ─────────────────────────────────────────────────────────────────

function ReplyForm({ msg, onSent, accent }: { msg: MessageEntry; onSent: () => void; accent: string }) {
  const { firebaseUser } = useAuth()
  const [subject, setSubject] = useState(`Re: ${msg.subject}`)
  const [body, setBody]       = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone]       = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firebaseUser || !body.trim()) return
    setSending(true)
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch('/api/messages/send', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({
          toUid:   msg.fromUid,
          toName:  msg.fromName,
          toRole:  msg.fromRole,
          subject: subject.trim() || `Re: ${msg.subject}`,
          body:    body.trim(),
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setDone(true)
      setTimeout(onSent, 1200)
    } catch (err) {
      console.error('[Reply] send failed:', err)
    } finally {
      setSending(false)
    }
  }

  if (done) {
    return (
      <div className="mt-4 rounded-xl border border-[rgba(0,200,83,0.2)] bg-[rgba(0,200,83,0.06)] px-4 py-3">
        <p className="text-[13px] text-[#00C853] flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M20 6 9 17l-5-5"/>
          </svg>
          Respuesta enviada correctamente
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-[rgba(255,255,255,0.08)] pt-4">
      <input
        value={subject}
        onChange={e => setSubject(e.target.value)}
        maxLength={120}
        className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[rgba(255,255,255,0.2)] outline-none focus:border-[rgba(170,255,0,0.35)] transition-colors"
        placeholder="Asunto"
      />
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        maxLength={1000}
        rows={3}
        className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-[rgba(255,255,255,0.2)] outline-none focus:border-[rgba(170,255,0,0.35)] resize-none transition-colors"
        placeholder="Escribí tu respuesta…"
      />
      <div className="flex items-center justify-end gap-3">
        <span className="text-[11px] text-[rgba(255,255,255,0.25)]">{body.length}/1000</span>
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="px-4 py-1.5 rounded-lg text-[13px] font-semibold text-[#0A0A0A] disabled:opacity-50 cursor-pointer border-none transition-opacity"
          style={{ background: accent }}
        >
          {sending ? 'Enviando…' : 'Enviar respuesta'}
        </button>
      </div>
    </form>
  )
}

// ── Inbox message detail ───────────────────────────────────────────────────────

function InboxDetail({ msg, onClose, accent }: { msg: MessageEntry; onClose: () => void; accent: string }) {
  const [showReply, setShowReply] = useState(false)

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-[1] w-full max-w-[480px] rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(8,12,10,0.97)] p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute left-3 right-3 top-0 h-[2px]" style={{ background: `linear-gradient(90deg,transparent,${accent},transparent)` }} />

        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-[16px] font-semibold text-white">{msg.subject}</h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[12px] text-[rgba(255,255,255,0.4)]">De {msg.fromName}</span>
              <RoleBadge role={msg.fromRole} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[rgba(255,255,255,0.4)] hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-all cursor-pointer bg-transparent border-none"
          >
            ×
          </button>
        </div>

        <p className="text-[14px] text-[rgba(255,255,255,0.8)] leading-relaxed whitespace-pre-wrap">{msg.body}</p>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-[11px] text-[rgba(255,255,255,0.25)]">{timeAgo(msg.createdAt)}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReply(r => !r)}
              className="px-4 py-1.5 rounded-lg text-[13px] font-medium border transition-all cursor-pointer bg-transparent"
              style={{
                borderColor: showReply ? accent : 'rgba(255,255,255,0.12)',
                color:       showReply ? accent : 'rgba(255,255,255,0.6)',
              }}
            >
              Responder
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-[13px] font-medium border border-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.6)] hover:text-white transition-colors cursor-pointer bg-transparent"
            >
              Cerrar
            </button>
          </div>
        </div>

        {showReply && <ReplyForm msg={msg} onSent={onClose} accent={accent} />}
      </div>
    </div>
  )
}

// ── Sent conversation detail ───────────────────────────────────────────────────

function SentDetail({ conv, onClose, accent }: { conv: ConversationSafe; onClose: () => void; accent: string }) {
  const isAtCap   = conv.status === 'pending' && conv.messageCount >= 3
  const isPending = conv.status === 'pending'

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-[1] w-full max-w-[480px] rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(8,12,10,0.97)] p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute left-3 right-3 top-0 h-[2px]" style={{ background: `linear-gradient(90deg,transparent,${accent},transparent)` }} />

        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-[16px] font-semibold text-white">{conv.subject}</h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[12px] text-[rgba(255,255,255,0.4)]">Para {conv.toName}</span>
              <RoleBadge role={conv.toRole} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[rgba(255,255,255,0.4)] hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-all cursor-pointer bg-transparent border-none"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="space-y-3 mb-4">
          {conv.messages.map((msg, i) => (
            <div key={msg.id} className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-[rgba(255,255,255,0.3)]">Mensaje {i + 1}</span>
                <SentStatusBadge status={conv.status} />
              </div>
              <p className="text-[13px] text-[rgba(255,255,255,0.8)] leading-relaxed whitespace-pre-wrap">{msg.body}</p>
            </div>
          ))}
        </div>

        {/* Cap warning — neutral language */}
        {isAtCap && isPending && (
          <div className="rounded-xl border border-[rgba(255,180,0,0.2)] bg-[rgba(255,180,0,0.06)] px-4 py-3 mb-4">
            <p className="text-[12px] text-[rgba(255,180,0,0.85)]">
              Enviaste el máximo de mensajes por ahora. Esperá la confirmación antes de continuar la conversación.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[rgba(255,255,255,0.25)]">{timeAgo(conv.createdAt)}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-[13px] font-medium border border-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.6)] hover:text-white transition-colors cursor-pointer bg-transparent"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  accent: string
}

export default function MessagesSection({ accent }: Props) {
  const { user, firebaseUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox')

  // Inbox (RTDB realtime subscription)
  const [inbox, setInbox]             = useState<MessageEntry[]>([])
  const [loadingInbox, setLoadingInbox] = useState(true)
  const [selectedMsg, setSelectedMsg] = useState<MessageEntry | null>(null)

  // Sent (Firestore API initial load + RTDB status overlay)
  const [sent, setSent]                 = useState<ConversationSafe[]>([])
  const [loadingSent, setLoadingSent]   = useState(false)
  const [selectedConv, setSelectedConv] = useState<ConversationSafe | null>(null)
  const [sentLoaded, setSentLoaded]     = useState(false)

  // Holds latest RTDB mirrors so loadSent can apply them immediately after fetch
  const rtdbMirrorsRef = useRef<UserConvMirror[]>([])

  // ── Inbox: realtime onValue subscription ──────────────────────────────────

  useEffect(() => {
    if (!user) return
    const unsub = subscribeMessages(user.uid, msgs => {
      setInbox(msgs)
      setLoadingInbox(false)
    })
    return unsub
  }, [user])

  // ── Sent: RTDB status overlay (runs always so badge updates immediately) ──

  useEffect(() => {
    if (!user) return
    const unsub = subscribeUserConversations(user.uid, mirrors => {
      rtdbMirrorsRef.current = mirrors
      setSent(prev => {
        if (prev.length === 0) return prev
        return prev.map(conv => {
          const mirror = mirrors.find(m => m.id === conv.id)
          if (!mirror) return conv
          return {
            ...conv,
            status:       mirror.status as ConversationStatus,
            messageCount: mirror.messageCount,
            updatedAt:    mirror.updatedAt,
          }
        })
      })
    })
    return unsub
  }, [user])

  // ── Sent: lazy initial fetch for full data (includes message bodies) ──────

  const loadSent = useCallback(async () => {
    if (!user || !firebaseUser || sentLoaded) return
    setLoadingSent(true)
    try {
      const token = await firebaseUser.getIdToken()
      const res   = await fetch('/api/messages/sent', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as { conversations: ConversationSafe[] }
      const mirrors = rtdbMirrorsRef.current
      // Overlay any already-received RTDB status mirrors
      const merged = (data.conversations ?? []).map(conv => {
        const mirror = mirrors.find(m => m.id === conv.id)
        if (!mirror) return conv
        return { ...conv, status: mirror.status as ConversationStatus, messageCount: mirror.messageCount, updatedAt: mirror.updatedAt }
      })
      setSent(merged)
      setSentLoaded(true)
    } catch (err) {
      console.error('[Messages] sent load failed:', err)
    } finally {
      setLoadingSent(false)
    }
  }, [user, firebaseUser, sentLoaded])

  useEffect(() => {
    if (activeTab !== 'sent') return
    const id = window.setTimeout(() => { void loadSent() }, 0)
    return () => window.clearTimeout(id)
  }, [activeTab, loadSent])

  const handleOpenMsg = async (msg: MessageEntry) => {
    setSelectedMsg(msg)
    if (!msg.read && user) {
      await markMessageRead(user.uid, msg.id).catch(() => null)
      setInbox(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m))
    }
  }

  const unreadCount = inbox.filter(m => !m.read).length

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="oc-dashboard-card rounded-[14px] overflow-hidden">
      {/* Tab switcher */}
      <div className="flex border-b border-[rgba(255,255,255,0.06)]">
        {([
          { id: 'inbox', label: 'Recibidos', count: unreadCount },
          { id: 'sent',  label: 'Enviados',  count: 0           },
        ] as { id: 'inbox' | 'sent'; label: string; count: number }[]).map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="flex-1 h-[44px] text-[13px] font-medium flex items-center justify-center gap-2 cursor-pointer bg-transparent border-none border-b-2 transition-colors"
            style={{
              borderBottomColor: activeTab === t.id ? accent : 'transparent',
              color: activeTab === t.id ? '#fff' : 'rgba(255,255,255,0.35)',
            }}
          >
            {t.label}
            {t.count > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                style={{ background: accent, color: '#0A0A0A' }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Inbox */}
      {activeTab === 'inbox' && (
        <div>
          {loadingInbox && (
            <div className="py-12 text-center text-[rgba(255,255,255,0.3)] text-[13px]">Cargando mensajes…</div>
          )}
          {!loadingInbox && inbox.length === 0 && (
            <div className="py-12 flex flex-col items-center gap-3">
              <svg className="w-8 h-8 text-[rgba(255,255,255,0.15)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/>
              </svg>
              <p className="text-[rgba(255,255,255,0.25)] text-[13px]">Sin mensajes recibidos aún.</p>
            </div>
          )}
          {!loadingInbox && inbox.map(msg => (
            <button
              key={msg.id}
              onClick={() => handleOpenMsg(msg)}
              className="w-full px-5 py-3.5 flex items-start gap-3 border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.03)] transition-colors cursor-pointer bg-transparent text-left"
            >
              {!msg.read && (
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accent }} />
              )}
              {msg.read && <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-transparent" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className={`text-[13px] truncate ${msg.read ? 'text-[rgba(255,255,255,0.6)]' : 'text-white font-medium'}`}>
                    {msg.fromName}
                  </span>
                  <span className="text-[11px] text-[rgba(255,255,255,0.25)] shrink-0">{timeAgo(msg.createdAt)}</span>
                </div>
                <p className={`text-[12px] truncate ${msg.read ? 'text-[rgba(255,255,255,0.3)]' : 'text-[rgba(255,255,255,0.7)]'}`}>
                  {msg.subject}
                </p>
                <div className="mt-1">
                  <RoleBadge role={msg.fromRole} />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Sent */}
      {activeTab === 'sent' && (
        <div>
          {loadingSent && (
            <div className="py-12 text-center text-[rgba(255,255,255,0.3)] text-[13px]">Cargando mensajes enviados…</div>
          )}
          {!loadingSent && sent.length === 0 && (
            <div className="py-12 flex flex-col items-center gap-3">
              <svg className="w-8 h-8 text-[rgba(255,255,255,0.15)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z"/>
              </svg>
              <p className="text-[rgba(255,255,255,0.25)] text-[13px]">Sin mensajes enviados aún.</p>
            </div>
          )}
          {!loadingSent && sent.map(conv => (
            <button
              key={conv.id}
              onClick={() => setSelectedConv(conv)}
              className="w-full px-5 py-3.5 flex items-start gap-3 border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.03)] transition-colors cursor-pointer bg-transparent text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[13px] text-[rgba(255,255,255,0.7)] truncate">
                    Para <span className="text-white font-medium">{conv.toName}</span>
                  </span>
                  <span className="text-[11px] text-[rgba(255,255,255,0.25)] shrink-0">{timeAgo(conv.createdAt)}</span>
                </div>
                <p className="text-[12px] text-[rgba(255,255,255,0.5)] truncate mb-1">{conv.subject}</p>
                <div className="flex items-center gap-2">
                  <RoleBadge role={conv.toRole} />
                  <SentStatusBadge status={conv.status} />
                  <span className="text-[11px] text-[rgba(255,255,255,0.25)]">{conv.messageCount}/3 msgs</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detalle inbox */}
      {selectedMsg && (
        <InboxDetail msg={selectedMsg} onClose={() => setSelectedMsg(null)} accent={accent} />
      )}

      {/* Detalle enviados */}
      {selectedConv && (
        <SentDetail conv={selectedConv} onClose={() => setSelectedConv(null)} accent={accent} />
      )}
    </div>
  )
}
