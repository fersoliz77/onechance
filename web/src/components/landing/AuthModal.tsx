'use client'
import { useState } from 'react'
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

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[140] bg-[rgba(0,0,0,0.72)] backdrop-blur-[10px] flex items-center justify-center px-4" onClick={onClose}>
      <div className="w-full max-w-[400px] bg-[#0C1F12] border border-[rgba(0,200,83,0.25)] rounded-2xl p-8 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-4 text-[rgba(255,255,255,0.3)] text-[22px] cursor-pointer bg-transparent border-none">x</button>

        {step === 0 && (
          <>
            <div className="text-oc-green text-[10px] tracking-[0.07em] mb-2 uppercase">Crear perfil</div>
            <h3 className="text-white text-[20px] font-medium tracking-[-0.02em] mb-1">¿Quién sos?</h3>
            <p className="text-[rgba(255,255,255,0.35)] text-[12px] mb-5">Elegí tu rol para continuar.</p>
            <div className="flex flex-col gap-2">
              {roles.map(r => (
                <button
                  key={r.label}
                  onClick={() => { setRole(r.label); setStep(1) }}
                  className="w-full flex items-center gap-3 px-4 h-[44px] rounded-[10px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] cursor-pointer"
                >
                  <span className="text-[16px]">{r.icon}</span>
                  <span className="text-[13px] text-[rgba(255,255,255,0.72)]">{r.label}</span>
                  <span className="ml-auto text-[rgba(255,255,255,0.2)]">→</span>
                </button>
              ))}
            </div>
            <button onClick={() => router.push('/auth?tab=login')} className="mt-4 w-full h-[40px] rounded-[9px] border border-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.65)] bg-transparent cursor-pointer">Ya tengo cuenta</button>
          </>
        )}

        {step === 1 && (
          <>
            <div className="text-oc-green text-[10px] tracking-[0.07em] mb-2 uppercase">Crear perfil · {role}</div>
            <h3 className="text-white text-[20px] font-medium tracking-[-0.02em] mb-4">Comenzá tu registro</h3>
            <div className="space-y-2 mb-4">
              <input className="w-full h-[40px] rounded-[8px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-3 text-[12px] outline-none" placeholder="Nombre completo" />
              <input className="w-full h-[40px] rounded-[8px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-3 text-[12px] outline-none" placeholder="Correo" />
              <input className="w-full h-[40px] rounded-[8px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-3 text-[12px] outline-none" placeholder="País" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(0)} className="flex-1 h-[40px] rounded-[8px] border border-[rgba(255,255,255,0.12)] bg-transparent text-[rgba(255,255,255,0.6)] cursor-pointer">Atrás</button>
              <button onClick={() => router.push('/auth?tab=register')} className="flex-[2] h-[40px] rounded-[8px] bg-oc-green text-oc-green-dark font-medium cursor-pointer border-none">Continuar →</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
