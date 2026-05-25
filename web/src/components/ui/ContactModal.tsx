'use client'

import { type CSSProperties, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Button from './Button'
import type { Role } from '@/types'

interface ContactModalProps {
  toUid:   string
  toName:  string
  toRole?: Role
  accent:  string
  onClose: () => void
}

export default function ContactModal({ toUid, toName, toRole = 'player', accent, onClose }: ContactModalProps) {
  const { user, firebaseUser } = useAuth()
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

  useEffect(() => {
    if (!sent) return
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [sent, onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !firebaseUser || !subject.trim() || !body.trim()) return
    setSending(true)
    setError(null)
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          toUid,
          toName,
          toRole,
          subject: subject.trim(),
          body:    body.trim(),
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setSent(true)
    } catch {
      setError('No se pudo enviar el mensaje. Intentá de nuevo.')
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
            <h2 className="text-[17px] font-[700] tracking-[-0.01em] text-white">Enviar mensaje</h2>
            <p className="mt-1 text-[12px] text-[var(--oc-fg-muted)]">a <span className="text-[var(--oc-accent)]">{toName}</span></p>
          </div>
          <button onClick={onClose} aria-label="Cerrar modal" className="-mt-0.5 text-[21px] leading-none text-[var(--oc-fg-dim)] transition-colors hover:text-white">×</button>
        </div>

        {sent ? (
          <div className="relative z-[1] py-6 text-center">
            <div className="text-[33px] mb-3">✓</div>
            <p className="text-white text-[15px] font-medium mb-1">Mensaje enviado</p>
            <p className="text-[rgba(255,255,255,0.4)] text-[13px] mb-1">Tu mensaje fue enviado correctamente.</p>
            <p className="text-[rgba(255,255,255,0.3)] text-[12px] mb-5">Esta ventana se cerrará automáticamente...</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setSent(false); setSubject(''); setBody('') }} className="flex-1 justify-center">Enviar otro</Button>
              <Button variant="outline" size="sm" onClick={onClose} className="flex-1 justify-center">Cerrar</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative z-[1] flex flex-col gap-[var(--oc-space-4)]">
            <div>
              <label className="mb-1.5 block text-[11px] uppercase tracking-[0.07em] text-[var(--oc-text-label)]">Asunto</label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                maxLength={120}
                required
                placeholder="Ej: Propuesta de contratación"
                className="w-full rounded-[var(--oc-radius-sm)] border border-[var(--oc-border-soft)] bg-[rgba(255,255,255,0.04)] px-3 py-2.5 text-[14px] text-white placeholder-[var(--oc-text-faint)] outline-none transition-colors focus:border-[var(--oc-border-strong)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] uppercase tracking-[0.07em] text-[var(--oc-text-label)]">Mensaje</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                maxLength={1000}
                required
                rows={4}
                placeholder="Describí brevemente tu propuesta o consulta…"
                className="w-full resize-none rounded-[var(--oc-radius-sm)] border border-[var(--oc-border-soft)] bg-[rgba(255,255,255,0.04)] px-3 py-2.5 text-[14px] text-white placeholder-[var(--oc-text-faint)] outline-none transition-colors focus:border-[var(--oc-border-strong)]"
              />
              <div className="mt-1 text-right text-[11px] text-[var(--oc-text-label)]">{body.length}/1000</div>
            </div>

            {error && <p className="text-red-400 text-[12px]">{error}</p>}

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
