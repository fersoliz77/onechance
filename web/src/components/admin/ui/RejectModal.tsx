'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  open: boolean
  profileName: string
  onConfirm: (reason: string) => void
  onCancel: () => void
}

export default function RejectModal({ open, profileName, onConfirm, onCancel }: Props) {
  const [reason, setReason] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!open) return
    const resetTimer = window.setTimeout(() => setReason(''), 0)
    const focusTimer = window.setTimeout(() => textareaRef.current?.focus(), 80)
    return () => {
      window.clearTimeout(resetTimer)
      window.clearTimeout(focusTimer)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}>
      <div
        className="w-full max-w-[440px] rounded-2xl border border-[rgba(255,60,60,0.2)] bg-[#111] shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden"
        style={{ animation: 'oc-fadeUp 0.15s ease both' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(255,255,255,0.07)]">
          <span className="w-8 h-8 rounded-lg bg-[rgba(255,60,60,0.1)] border border-[rgba(255,60,60,0.2)] flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-[rgba(255,100,100,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
            </svg>
          </span>
          <div>
            <p className="text-[15px] font-semibold text-white">Rechazar perfil</p>
            <p className="text-[12px] text-[rgba(255,255,255,0.35)] truncate max-w-[300px]">{profileName}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="text-[12px] font-medium text-[rgba(255,255,255,0.5)] mb-1.5 block">
              Motivo del rechazo
              <span className="ml-1 text-[rgba(255,255,255,0.25)] font-normal">(opcional — el usuario lo verá)</span>
            </label>
            <textarea
              ref={textareaRef}
              value={reason}
              onChange={e => setReason(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Ej: Faltan datos de contacto. Por favor completá tu información antes de reenviar."
              className="w-full text-sm text-white rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3.5 py-2.5 outline-none resize-none focus:border-[rgba(255,100,100,0.4)] focus:bg-[rgba(255,60,60,0.04)] transition-all placeholder:text-[rgba(255,255,255,0.18)]"
            />
            <p className="text-right text-[11px] text-[rgba(255,255,255,0.2)] mt-1">{reason.length}/500</p>
          </div>

          <div className="rounded-lg border border-[rgba(255,180,0,0.2)] bg-[rgba(255,180,0,0.05)] px-3.5 py-2.5 flex gap-2">
            <svg className="w-4 h-4 text-[rgba(255,180,0,0.7)] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            </svg>
            <p className="text-[12px] text-[rgba(255,200,80,0.8)] leading-[1.5]">
              El usuario podrá corregir su perfil y reenviarlo a revisión.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-[rgba(255,255,255,0.07)]">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg text-[13px] font-medium text-[rgba(255,255,255,0.45)] border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all cursor-pointer bg-transparent">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason.trim())}
            className="flex-1 py-2 rounded-lg text-[13px] font-semibold cursor-pointer border-none transition-all"
            style={{ background: 'rgba(255,60,60,0.15)', color: '#FF6060', border: '1px solid rgba(255,60,60,0.3)' }}>
            Confirmar rechazo
          </button>
        </div>
      </div>
    </div>
  )
}
