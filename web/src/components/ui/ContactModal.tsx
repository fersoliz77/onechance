'use client'

import { type CSSProperties, useEffect, useState } from 'react'
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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

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
      <div className="absolute inset-0 bg-[var(--oc-overlay)] backdrop-blur-[6px]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Enviar mensaje a ${toName}`}
        className="relative z-[1] w-full max-w-[440px] overflow-hidden rounded-[var(--oc-radius-xl)] border border-[var(--oc-border-soft)] bg-[rgba(7,20,24,0.9)] p-[var(--oc-space-6)] shadow-[0_0_0_1px_rgba(0,212,255,0.04),0_24px_64px_rgba(0,0,0,0.5)]"
        style={{ '--oc-accent': accent, boxShadow: `0 0 0 1px color-mix(in srgb, var(--oc-accent) 16%, transparent), 0 24px 64px rgba(0,0,0,0.5)` } as CSSProperties}
        onClick={e => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.05)_0%,transparent_45%,rgba(255,255,255,0.02)_100%)]" />
        <div className="absolute left-3 right-3 top-0 h-[2px] bg-[linear-gradient(90deg,transparent,var(--oc-accent),transparent)]" />

        <div className="relative z-[1] mb-[var(--oc-space-5)] flex items-start justify-between">
          <div>
            <h2 className="text-[16px] font-[700] tracking-[-0.01em] text-white">Enviar mensaje</h2>
            <p className="mt-1 text-[11px] text-[var(--oc-fg-muted)]">a <span className="text-[var(--oc-accent)]">{toName}</span></p>
          </div>
          <button onClick={onClose} className="-mt-0.5 text-[20px] leading-none text-[var(--oc-fg-dim)] transition-colors hover:text-white">×</button>
        </div>

        {sent ? (
          <div className="relative z-[1] py-6 text-center">
            <div className="text-[32px] mb-3">✓</div>
            <p className="text-white text-[14px] font-medium mb-1">Mensaje enviado</p>
            <p className="text-[rgba(255,255,255,0.4)] text-[12px] mb-5">{toName} recibirá una notificación.</p>
            <Button variant="outline" size="sm" onClick={onClose} className="w-full justify-center">Cerrar</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative z-[1] flex flex-col gap-[var(--oc-space-4)]">
            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-[0.07em] text-[var(--oc-text-label)]">Asunto</label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                maxLength={120}
                required
                placeholder="Ej: Propuesta de contratación"
                className="w-full rounded-[var(--oc-radius-sm)] border border-[var(--oc-border-soft)] bg-[rgba(255,255,255,0.04)] px-3 py-2.5 text-[13px] text-white placeholder-[var(--oc-text-faint)] outline-none transition-colors focus:border-[var(--oc-border-strong)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-[0.07em] text-[var(--oc-text-label)]">Mensaje</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                maxLength={1000}
                required
                rows={4}
                placeholder="Describí brevemente tu propuesta o consulta…"
                className="w-full resize-none rounded-[var(--oc-radius-sm)] border border-[var(--oc-border-soft)] bg-[rgba(255,255,255,0.04)] px-3 py-2.5 text-[13px] text-white placeholder-[var(--oc-text-faint)] outline-none transition-colors focus:border-[var(--oc-border-strong)]"
              />
              <div className="mt-1 text-right text-[10px] text-[var(--oc-text-label)]">{body.length}/1000</div>
            </div>

            {error && <p className="text-red-400 text-[11px]">{error}</p>}

            <div className="mt-1 flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} className="flex-1 justify-center">Cancelar</Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={sending || !subject.trim() || !body.trim()}
                className="flex-1 justify-center border-[var(--oc-accent)] bg-[var(--oc-accent)] text-[#0A0A0A]"
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
