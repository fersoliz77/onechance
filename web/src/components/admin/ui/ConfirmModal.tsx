'use client'
import { useEffect } from 'react'

interface Props {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ open, title, description, confirmLabel = 'Confirmar', danger = false, onConfirm, onCancel }: Props) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-5"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}
      role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div
        className="relative w-full max-w-[420px] rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[#141414] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
        style={{ animation: 'oc-fadeUp 0.18s ease both' }}
        onClick={e => e.stopPropagation()}>
        {/* Icon */}
        <div className="mb-4 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: danger ? 'rgba(244,63,94,0.12)' : 'rgba(170,255,0,0.1)' }}>
          {danger
            ? <svg className="w-5 h-5 text-[#F43F5E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
            : <svg className="w-5 h-5 text-[#AAFF00]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 9v4m0 4h.01"/><circle cx="12" cy="12" r="9"/></svg>
          }
        </div>
        <h2 id="confirm-title" className="text-[18px] font-semibold text-white mb-1.5">{title}</h2>
        {description && <p className="text-[14px] text-[rgba(255,255,255,0.4)] leading-relaxed mb-6">{description}</p>}
        <div className="flex gap-3 justify-end mt-5">
          <button onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-[14px] font-medium text-[rgba(255,255,255,0.5)] border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all cursor-pointer bg-transparent">
            Cancelar
          </button>
          <button onClick={() => { onConfirm(); }}
            className="px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all cursor-pointer border-none"
            style={danger
              ? { background: 'rgba(244,63,94,0.18)', color: '#F43F5E', outline: '1px solid rgba(244,63,94,0.35)' }
              : { background: '#AAFF00', color: '#000' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
