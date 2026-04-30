'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { register, login, createUserRecord, createPlayerRecord, createCoachRecord, createClubRecord, createAgentRecord } from '@/lib/auth'
import Background from '@/components/layout/Background'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { POSITIONS, COUNTRIES, type Role } from '@/types'

const ROLES = [
  { id: 'player', icon: '⚽', title: 'Jugador / Jugadora', desc: 'Mostrá tu perfil a clubes y representantes.' },
  { id: 'coach',  icon: '📋', title: 'Técnico',            desc: 'Publicá tu experiencia y buscá nuevos proyectos.' },
  { id: 'club',   icon: '🏟️', title: 'Club',              desc: 'Presentá tu institución y buscá talento.' },
  { id: 'agent',  icon: '🤝', title: 'Representante',      desc: 'Mostrá tu agencia y los jugadores que representás.' },
]

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-1.5 items-center justify-center mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-[6px] rounded-[3px] transition-all duration-300"
          style={{
            width: i === current ? 18 : 6,
            background: i === current ? '#00C853' : i < current ? 'rgba(0,200,83,0.4)' : 'rgba(255,255,255,0.1)',
          }}
        />
      ))}
    </div>
  )
}

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const submit = async () => {
    if (!email || !pass) { setErr('Completá todos los campos.'); return }
    setLoading(true)
    try {
      await login(email, pass)
      router.push('/dashboard')
    } catch {
      setErr('Email o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="text-[rgba(255,255,255,0.2)] text-[9px] tracking-[0.08em] uppercase mb-1.5">Bienvenido de vuelta</div>
      <div className="text-white text-[22px] font-medium tracking-[-0.02em] mb-1.5">Ingresá a tu cuenta</div>
      <div className="text-[rgba(255,255,255,0.35)] text-[12px] mb-6">
        ¿No tenés cuenta?{' '}
        <button onClick={onSwitch} className="text-oc-green cursor-pointer bg-none border-none font-sans">Registrate gratis</button>
      </div>
      <div className="flex flex-col gap-2.5 mb-4">
        <Input placeholder="Correo electrónico" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <Input placeholder="Contraseña" type="password" value={pass} onChange={e => setPass(e.target.value)} />
      </div>
      {err && <div className="text-[#FF6060] text-[11px] mb-3">{err}</div>}
      <Button variant="primary" className="w-full justify-center mb-3" size="lg" onClick={submit} disabled={loading}>
        {loading ? 'Ingresando...' : 'Ingresar →'}
      </Button>
      <div className="text-center">
        <span className="text-[rgba(0,200,83,0.6)] text-[11px] cursor-pointer">¿Olvidaste tu contraseña?</span>
      </div>
    </div>
  )
}

function RegisterForm({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [creds, setCreds] = useState({ email: '', pass: '', confirm: '' })
  const [role, setRole] = useState<Role | null>(null)
  const [form, setForm] = useState({ fullName: '', birthDate: '', nationality: '', position: '' })
  const [isMinor, setIsMinor] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const checkBirth = (v: string) => {
    setForm(f => ({ ...f, birthDate: v }))
    if (v) {
      const age = Math.floor((Date.now() - new Date(v).getTime()) / 31_557_600_000)
      setIsMinor(age < 18)
    }
  }

  const step0Submit = () => {
    if (!creds.email || !creds.pass || !creds.confirm) { setErr('Completá todos los campos.'); return }
    if (creds.pass !== creds.confirm) { setErr('Las contraseñas no coinciden.'); return }
    if (creds.pass.length < 6) { setErr('La contraseña debe tener al menos 6 caracteres.'); return }
    setErr(''); setStep(1)
  }

  const step2Submit = async () => {
    if (!form.fullName) { setErr('Ingresá tu nombre completo.'); return }
    if (!role) return
    setLoading(true)
    try {
      const { user } = await register(creds.email, creds.pass)
      await createUserRecord(user.uid, creds.email, form.fullName, role)
      const base = { fullName: form.fullName, birthDate: form.birthDate, nationality: form.nationality, isMinor }
      if (role === 'player') await createPlayerRecord(user.uid, { ...base, position: form.position })
      else if (role === 'coach') await createCoachRecord(user.uid, base)
      else if (role === 'club') await createClubRecord(user.uid, base)
      else if (role === 'agent') await createAgentRecord(user.uid, base)
      setStep(3)
      setTimeout(() => router.push('/dashboard'), 1800)
    } catch (e: any) {
      setErr(e?.message ?? 'Error al registrarse.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 3) {
    return (
      <div className="text-center py-5">
        <div className="text-[44px] mb-4">⚽</div>
        <div className="text-oc-green text-[20px] font-medium tracking-[-0.02em] mb-2">¡Perfil creado!</div>
        {isMinor
          ? <p className="text-[rgba(255,255,255,0.4)] text-[12px] leading-[1.7]">Tu perfil está <span className="text-oc-yellow">pendiente de revisión</span>.<br />Al ser menor de 18 años, un admin debe aprobarlo.</p>
          : <p className="text-[rgba(255,255,255,0.4)] text-[12px] leading-[1.7]">Redirigiendo a tu panel…</p>
        }
      </div>
    )
  }

  return (
    <div>
      <StepDots total={3} current={step} />

      {step === 0 && (
        <>
          <div className="text-[rgba(255,255,255,0.2)] text-[9px] tracking-[0.08em] uppercase mb-1.5">Paso 1 de 3</div>
          <div className="text-white text-[22px] font-medium tracking-[-0.02em] mb-5">Creá tu cuenta</div>
          <div className="flex flex-col gap-2.5 mb-4">
            <Input placeholder="Correo electrónico" type="email" value={creds.email} onChange={e => setCreds(c => ({ ...c, email: e.target.value }))} />
            <Input placeholder="Contraseña" type="password" value={creds.pass} onChange={e => setCreds(c => ({ ...c, pass: e.target.value }))} />
            <Input placeholder="Confirmá tu contraseña" type="password" value={creds.confirm} onChange={e => setCreds(c => ({ ...c, confirm: e.target.value }))} />
          </div>
          {err && <div className="text-[#FF6060] text-[11px] mb-2.5">{err}</div>}
          <Button variant="primary" className="w-full justify-center" size="lg" onClick={step0Submit}>Continuar →</Button>
        </>
      )}

      {step === 1 && (
        <>
          <div className="text-[rgba(255,255,255,0.2)] text-[9px] tracking-[0.08em] uppercase mb-1.5">Paso 2 de 3</div>
          <div className="text-white text-[22px] font-medium tracking-[-0.02em] mb-1.5">¿Quién sos?</div>
          <div className="text-[rgba(255,255,255,0.35)] text-[12px] mb-5">Elegí tu rol para personalizar tu perfil.</div>
          <div className="flex flex-col gap-2 mb-4">
            {ROLES.map(r => (
              <button
                key={r.id}
                onClick={() => { setRole(r.id as Role); setStep(2) }}
                className="flex items-center gap-3.5 text-left rounded-[10px] px-4 py-3 cursor-pointer font-sans transition-all duration-150 border"
                style={{
                  background: role === r.id ? 'rgba(0,200,83,0.08)' : 'rgba(255,255,255,0.03)',
                  borderColor: role === r.id ? 'rgba(0,200,83,0.3)' : 'rgba(255,255,255,0.08)',
                }}
              >
                <span className="text-[20px] shrink-0">{r.icon}</span>
                <div>
                  <div className="text-white text-[13px] font-medium">{r.title}</div>
                  <div className="text-[rgba(255,255,255,0.3)] text-[10px] mt-0.5">{r.desc}</div>
                </div>
                <span className="ml-auto text-[rgba(255,255,255,0.2)] text-[13px]">→</span>
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setStep(0)}>← Atrás</Button>
        </>
      )}

      {step === 2 && role && (
        <>
          <div className="text-[rgba(255,255,255,0.2)] text-[9px] tracking-[0.08em] uppercase mb-1.5">
            Paso 3 de 3 · {ROLES.find(r => r.id === role)?.title}
          </div>
          <div className="text-white text-[22px] font-medium tracking-[-0.02em] mb-5">Tus datos</div>
          <div className="flex flex-col gap-2.5 mb-3.5">
            <Input placeholder="Nombre y apellido" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
            <div>
              <div className="text-[rgba(255,255,255,0.25)] text-[9px] uppercase tracking-[0.06em] mb-1.5">Fecha de nacimiento</div>
              <input
                type="date"
                value={form.birthDate}
                onChange={e => checkBirth(e.target.value)}
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-[8px] px-3 py-[9px] text-white text-[12px] outline-none"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            {isMinor && (
              <div className="bg-[rgba(255,180,0,0.08)] border border-[rgba(255,180,0,0.3)] rounded-[9px] p-[10px_13px] flex gap-2 items-start">
                <span className="text-[14px]">⚠️</span>
                <div className="text-[rgba(255,180,0,0.9)] text-[11px] leading-[1.6]">
                  Sos menor de 18 años. Tu perfil quedará en revisión hasta que un admin lo apruebe.
                </div>
              </div>
            )}
            <Select
              value={form.nationality}
              onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
              options={[{ value: '', label: 'Nacionalidad' }, ...COUNTRIES.map(c => ({ value: c, label: c }))]}
            />
            {role === 'player' && (
              <Select
                value={form.position}
                onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                options={[{ value: '', label: 'Puesto principal' }, ...POSITIONS.map(p => ({ value: p, label: p }))]}
              />
            )}
          </div>
          {err && <div className="text-[#FF6060] text-[11px] mb-2.5">{err}</div>}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1 justify-center">Atrás</Button>
            <Button variant="primary" onClick={step2Submit} className="flex-[2] justify-center" disabled={loading}>
              {loading ? 'Creando...' : 'Crear perfil →'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

function AuthContent() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login'
  const [tab, setTab] = useState(initialTab)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) router.push('/dashboard')
  }, [user, router])

  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-[2] pt-14 flex items-center justify-center min-h-screen px-6 py-8">
        <div className="w-full max-w-[420px]">
          {/* Tab toggle */}
          <div className="flex bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[10px] p-1 mb-7">
            {([['login','Ingresar'],['register','Crear cuenta']] as const).map(([t,l]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2 rounded-[7px] text-[12px] font-medium cursor-pointer font-sans transition-all duration-200 border-none"
                style={{
                  background: tab === t ? '#00C853' : 'transparent',
                  color: tab === t ? '#002A12' : 'rgba(255,255,255,0.35)',
                }}
              >
                {l}
              </button>
            ))}
          </div>
          {/* Card */}
          <div className="bg-[rgba(8,15,25,0.9)] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-7 backdrop-blur-[20px]">
            {tab === 'login'
              ? <LoginForm onSwitch={() => setTab('register')} />
              : <RegisterForm onDone={() => setTab('login')} />
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
  )
}
