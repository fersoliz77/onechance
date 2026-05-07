'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  open: boolean
  onClose: () => void
}

const roles = [
  { icon: '⚽', label: 'Jugador / Jugadora' },
  { icon: '📋', label: 'Técnico / Entrenador' },
  { icon: '🏟️', label: 'Club' },
  { icon: '🤝', label: 'Representante' },
]

export default function AuthModal({ open, onClose }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [role, setRole] = useState('')

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[rgba(0,0,0,0.76)] px-4 backdrop-blur-[12px]" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Crear perfil" className="w-full max-w-[420px] rounded-[16px] border border-[rgba(170,255,0,0.24)] bg-[linear-gradient(165deg,rgba(20,35,18,0.2),rgba(15,22,18,0.3))] p-8 shadow-[0_24px_64px_rgba(0,0,0,0.5),0_0_0_1px_rgba(170,255,0,0.06),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[22px]" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-3 border-none bg-transparent text-[23px] text-[var(--oc-text-muted)] transition-colors hover:text-white">x</button>

        {step === 0 && (
          <>
            <div className="mb-2 text-[11px] uppercase tracking-[0.07em] text-[var(--oc-lime)]">Crear perfil</div>
            <h3 className="text-white text-[21px] font-medium tracking-[-0.02em] mb-1">¿Quién sos?</h3>
            <p className="mb-5 text-[13px] text-[var(--oc-text-muted)]">Elegí tu rol para continuar.</p>
            <div className="flex flex-col gap-2">
              {roles.map(r => (
                <button
                  key={r.label}
                  onClick={() => { setRole(r.label); setStep(1) }}
                  className="flex h-[44px] w-full cursor-pointer items-center gap-3 rounded-[10px] border border-[var(--oc-border-soft)] bg-[var(--oc-surface-2)] px-4 transition-all hover:border-[var(--oc-border-green)] hover:bg-[rgba(170,255,0,0.06)]"
                >
                  <span className="text-[17px]">{r.icon}</span>
                  <span className="text-[14px] text-[var(--oc-text-primary)]">{r.label}</span>
                  <span className="ml-auto text-[var(--oc-text-faint)]">→</span>
                </button>
              ))}
            </div>
            <button onClick={() => router.push('/auth?tab=login')} className="mt-4 h-[40px] w-full cursor-pointer rounded-[9px] border border-[var(--oc-border-strong)] bg-transparent text-[var(--oc-text-muted)] transition-colors hover:border-[var(--oc-border-hi)] hover:text-white">Ya tengo cuenta</button>
          </>
        )}

        {step === 1 && (
          <>
            <div className="mb-2 text-[11px] uppercase tracking-[0.07em] text-[var(--oc-lime)]">Crear perfil · {role}</div>
            <h3 className="text-white text-[21px] font-medium tracking-[-0.02em] mb-4">Comenzá tu registro</h3>
            <div className="space-y-2 mb-4">
              <input className="h-[40px] w-full rounded-[8px] border border-[var(--oc-border-strong)] bg-[var(--oc-surface-2)] px-3 text-[13px] text-white outline-none placeholder:text-[var(--oc-text-faint)] focus-visible:border-[var(--oc-border-green)]" placeholder="Nombre completo" />
              <input className="h-[40px] w-full rounded-[8px] border border-[var(--oc-border-strong)] bg-[var(--oc-surface-2)] px-3 text-[13px] text-white outline-none placeholder:text-[var(--oc-text-faint)] focus-visible:border-[var(--oc-border-green)]" placeholder="Correo" />
              <input className="h-[40px] w-full rounded-[8px] border border-[var(--oc-border-strong)] bg-[var(--oc-surface-2)] px-3 text-[13px] text-white outline-none placeholder:text-[var(--oc-text-faint)] focus-visible:border-[var(--oc-border-green)]" placeholder="País" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(0)} className="h-[40px] flex-1 cursor-pointer rounded-[8px] border border-[var(--oc-border-strong)] bg-transparent text-[var(--oc-text-muted)] transition-colors hover:border-[var(--oc-border-hi)] hover:text-white">Atrás</button>
              <button onClick={() => router.push('/auth?tab=register')} className="h-[40px] flex-[2] cursor-pointer rounded-[8px] border-none bg-[linear-gradient(135deg,#FFD24A_0%,#FFB400_56%,#F59E0B_100%)] font-medium text-[#1A1200] shadow-[0_10px_24px_rgba(255,180,0,0.28)] transition-all hover:-translate-y-0.5">Continuar →</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
