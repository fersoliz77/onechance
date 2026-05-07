'use client'
import type { Toast } from '@/hooks/useToast'

const STYLES: Record<string, { border: string; icon: string; color: string }> = {
  success: { border: 'rgba(170,255,0,0.35)',  icon: '✓', color: '#AAFF00' },
  error:   { border: 'rgba(244,63,94,0.35)',   icon: '✕', color: '#F43F5E' },
  warn:    { border: 'rgba(245,158,11,0.35)',  icon: '⚠', color: '#F59E0B' },
  info:    { border: 'rgba(59,130,246,0.35)',  icon: 'ℹ', color: '#3B82F6' },
}

interface Props {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export default function ToastStack({ toasts, onRemove }: Props) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map(t => {
        const s = STYLES[t.type]
        return (
          <div key={t.id}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl border shadow-[0_16px_48px_rgba(0,0,0,0.55)] animate-[oc-fadeUp_0.25s_ease_both]"
            style={{ background: 'rgba(20,20,20,0.92)', borderColor: s.border, minWidth: 260, maxWidth: 380 }}>
            <span className="text-[16px] font-black shrink-0" style={{ color: s.color }}>{s.icon}</span>
            <p className="text-[14px] text-white flex-1">{t.message}</p>
            <button onClick={() => onRemove(t.id)}
              className="text-[rgba(255,255,255,0.3)] hover:text-white transition-colors text-lg leading-none cursor-pointer bg-transparent border-none shrink-0"
              aria-label="Cerrar notificación">×</button>
          </div>
        )
      })}
    </div>
  )
}
