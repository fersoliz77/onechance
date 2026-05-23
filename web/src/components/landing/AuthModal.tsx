'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  open: boolean
  onClose: () => void
}

const roles = [
  { id: 'player', icon: '⚽', label: 'Jugador / Jugadora' },
  { id: 'coach',  icon: '📋', label: 'Técnico / Entrenador' },
  { id: 'club',   icon: '🏟️', label: 'Club' },
  { id: 'agent',  icon: '🤝', label: 'Representante' },
]

export default function AuthModal({ open, onClose }: Props) {
  const router = useRouter()
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const handleRoleSelect = (roleId: string) => {
    if (animating) return
    setAnimating(true)
    router.push(`/auth?tab=register&role=${roleId}`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[rgba(0,0,0,0.76)] px-4 backdrop-blur-[12px]" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Crear perfil" className="w-full max-w-[420px] rounded-[16px] border border-[rgba(170,255,0,0.24)] bg-[linear-gradient(165deg,rgba(20,35,18,0.2),rgba(15,22,18,0.3))] p-8 shadow-[0_24px_64px_rgba(0,0,0,0.5),0_0_0_1px_rgba(170,255,0,0.06),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[22px]" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-3 border-none bg-transparent text-[23px] text-[var(--oc-text-muted)] transition-colors hover:text-white">×</button>

        <div className="mb-2 text-[11px] uppercase tracking-[0.07em] text-[var(--oc-lime)]">Crear perfil</div>
        <h3 className="mb-1 text-[21px] font-medium tracking-[-0.02em] text-white">¿Quién sos?</h3>
        <p className="mb-5 text-[13px] text-[var(--oc-text-muted)]">Elegí tu rol para comenzar el registro.</p>

        <div className="flex flex-col gap-2">
          {roles.map(r => (
            <button
              key={r.id}
              onClick={() => handleRoleSelect(r.id)}
              className="flex h-[44px] w-full cursor-pointer items-center gap-3 rounded-[10px] border border-[var(--oc-border-soft)] bg-[var(--oc-surface-2)] px-4 transition-all hover:border-[var(--oc-border-green)] hover:bg-[rgba(170,255,0,0.06)]"
            >
              <span className="text-[17px]">{r.icon}</span>
              <span className="text-[14px] text-[var(--oc-text-primary)]">{r.label}</span>
              <span className="ml-auto text-[var(--oc-text-faint)]">→</span>
            </button>
          ))}
        </div>
        <button onClick={() => router.push('/auth?tab=login')} className="mt-4 h-[40px] w-full cursor-pointer rounded-[9px] border border-[var(--oc-border-strong)] bg-transparent text-[var(--oc-text-muted)] transition-colors hover:border-[var(--oc-border-hi)] hover:text-white">Ya tengo cuenta</button>
      </div>
    </div>
  )
}
