'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { sendMessage, addNotification } from '@/lib/rtdb'
import Button from './Button'

interface ContactModalProps {
  toUid: string
  toName: string
  accent: string
  onClose: () => void
}

export default function ContactModal({ toUid, toName, accent, onClose }: ContactModalProps) {
  const { user } = useAuth()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !subject.trim() || !body.trim()) return
    setSending(true)
    setError(null)
    try {
      const now = new Date().toISOString()
      await sendMessage(toUid, {
        fromUid: user.uid,
        fromName: user.name || user.email || 'Usuario',
        fromRole: user.role ?? 'player',
        subject: subject.trim(),
        body: body.trim(),
        read: false,
        createdAt: now,
      })
      await addNotification(toUid, {
        type: 'contact_received',
        message: `${user.name || user.email || 'Un usuario'} te envió un mensaje: "${subject.trim()}"`,
        read: false,
        createdAt: now,
        fromName: user.name || user.email || 'Usuario',
      })
      setSent(true)
    } catch {
      setError('No se pudo enviar el mensaje. Intenta de nuevo.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[6px]" />
      <div
        className="relative z-[1] w-full max-w-[420px] rounded-[16px] border p-6 shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
        style={{ background: 'linear-gradient(135deg,#0D0F1A,#070810)', borderColor: `${accent}30` }}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-[2px] absolute top-0 left-0 right-0 rounded-t-[16px]" style={{ background: `linear-gradient(90deg,${accent},transparent)` }} />

        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-[15px] font-semibold text-white">Enviar mensaje</h2>
            <p className="text-[11px] mt-0.5" style={{ color: `${accent}99` }}>a {toName}</p>
          </div>
          <button onClick={onClose} className="text-[rgba(255,255,255,0.3)] hover:text-white transition-colors text-[18px] leading-none -mt-0.5">×</button>
        </div>

        {sent ? (
          <div className="text-center py-6">
            <div className="text-[32px] mb-3">✓</div>
            <p className="text-white text-[14px] font-medium mb-1">Mensaje enviado</p>
            <p className="text-[rgba(255,255,255,0.4)] text-[12px] mb-5">{toName} recibirá una notificación.</p>
            <Button variant="outline" size="sm" onClick={onClose} className="w-full justify-center">Cerrar</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="text-[10px] uppercase tracking-[0.07em] text-[rgba(255,255,255,0.3)] block mb-1.5">Asunto</label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                maxLength={120}
                required
                placeholder="Ej: Propuesta de contratación"
                className="w-full rounded-[8px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-3 py-2.5 text-[13px] text-white placeholder-[rgba(255,255,255,0.2)] outline-none focus:border-[rgba(255,255,255,0.2)] transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.07em] text-[rgba(255,255,255,0.3)] block mb-1.5">Mensaje</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                maxLength={1000}
                required
                rows={4}
                placeholder="Describí brevemente tu propuesta o consulta…"
                className="w-full rounded-[8px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-3 py-2.5 text-[13px] text-white placeholder-[rgba(255,255,255,0.2)] outline-none focus:border-[rgba(255,255,255,0.2)] transition-colors resize-none"
              />
              <div className="text-[10px] text-[rgba(255,255,255,0.2)] text-right mt-1">{body.length}/1000</div>
            </div>

            {error && <p className="text-red-400 text-[11px]">{error}</p>}

            <div className="flex gap-2 mt-1">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} className="flex-1 justify-center">Cancelar</Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={sending || !subject.trim() || !body.trim()}
                className="flex-1 justify-center"
                style={{ background: accent, borderColor: accent }}
              >
                {sending ? 'Enviando…' : 'Enviar mensaje'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
