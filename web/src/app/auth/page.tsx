'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { register, login, sendPasswordResetEmail, auth, createUserRecord, createPlayerRecord, createCoachRecord, createClubRecord, createAgentRecord } from '@/lib/auth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { POSITIONS, COUNTRIES, type Role } from '@/types'

const ROLES = [
  { id: 'player', icon: '⚽', title: 'Jugador / Jugadora', desc: 'Mostrá tu perfil a clubes y representantes.' },
  { id: 'coach',  icon: '📋', title: 'Técnico',            desc: 'Publicá tu experiencia y buscá nuevos proyectos.' },
  { id: 'club',   icon: '🏟️', title: 'Club',              desc: 'Presentá tu institución y buscá talento.' },
  { id: 'agent',  icon: '🤝', title: 'Representante',      desc: 'Mostrá tu agencia y los jugadores que representás.' },
]

const STEP_NAMES = ['Cuenta', 'Rol', 'Datos']
const INTENT_KEY = 'oc_auth_intent'
const ROLE_KEY = 'oc_selected_role'

function getRoleDashboardPath(role: Role) {
  return `/dashboard?role=${role}`
}

function persistAuthIntent(role?: Role) {
  try {
    sessionStorage.setItem(INTENT_KEY, 'create-profile')
    if (role) sessionStorage.setItem(ROLE_KEY, role)
  } catch {
    // no-op
  }
}

function readPersistedRole(): Role | undefined {
  try {
    if (sessionStorage.getItem(INTENT_KEY) !== 'create-profile') return undefined
    const stored = sessionStorage.getItem(ROLE_KEY)
    return VALID_ROLES.includes(stored as Role) ? (stored as Role) : undefined
  } catch {
    return undefined
  }
}

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="mb-6 flex items-center justify-center gap-3">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div
            className="h-[6px] rounded-[3px] transition-all duration-300"
            style={{
              width: i === current ? 18 : 6,
              background: i === current ? 'var(--oc-lime)' : i < current ? 'rgba(170,255,0,0.42)' : 'var(--oc-surface-2)',
            }}
          />
          {i === current && (
            <span className="text-[11px] font-[600] text-[var(--oc-lime)]">{STEP_NAMES[i]}</span>
          )}
        </div>
      ))}
    </div>
  )
}

function RoleSelect({ value, onChange }: { value: Role | ''; onChange: (next: Role) => void }) {
  const [open, setOpen] = useState(false)
  const selected = ROLES.find(r => r.id === value)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full h-[var(--oc-control-h-md)] rounded-[8px] border border-[var(--oc-border-strong)] bg-[var(--oc-surface-2)] px-3 text-left text-[14px] lg:text-[15px] text-white outline-none cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-[rgba(0,200,83,0.28)] focus-visible:border-[rgba(0,200,83,0.38)] flex items-center"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? 'text-white' : 'text-[rgba(255,255,255,0.35)]'}>{selected?.title ?? 'Seleccioná tu rol'}</span>
        <span className={`ml-auto text-[rgba(255,255,255,0.7)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-[10px] border border-[var(--oc-border-strong)] bg-[linear-gradient(170deg,rgba(16,28,22,0.98),rgba(10,16,13,0.98))] shadow-[0_16px_44px_rgba(0,0,0,0.45)] backdrop-blur-[10px]">
          <div role="listbox" aria-label="Rol del perfil" className="p-1.5">
            {ROLES.map(r => {
              const active = value === r.id
              return (
                <button
                  key={r.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => { onChange(r.id as Role); setOpen(false) }}
                  className="w-full h-10 rounded-[8px] px-3 text-left text-[14px] transition-colors cursor-pointer"
                  style={{
                    color: active ? '#132008' : 'rgba(255,255,255,0.88)',
                    background: active ? 'var(--oc-lime)' : 'transparent',
                  }}
                >
                  <span className="mr-2" aria-hidden="true">{r.icon}</span>
                  {r.title}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function DarkDropdown({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string
  placeholder: string
  options: Array<{ value: string; label: string }>
  onChange: (next: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full h-[var(--oc-control-h-md)] rounded-[8px] border border-[var(--oc-border-strong)] bg-[var(--oc-surface-2)] px-3 text-left text-[14px] lg:text-[15px] outline-none cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-[rgba(0,200,83,0.28)] focus-visible:border-[rgba(0,200,83,0.38)] flex items-center"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? 'text-white' : 'text-[rgba(255,255,255,0.35)]'}>{selected?.label ?? placeholder}</span>
        <span className={`ml-auto text-[rgba(255,255,255,0.7)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-[220px] overflow-y-auto rounded-[10px] border border-[var(--oc-border-strong)] bg-[linear-gradient(170deg,rgba(16,28,22,0.98),rgba(10,16,13,0.98))] shadow-[0_16px_44px_rgba(0,0,0,0.45)] backdrop-blur-[10px]">
          <div role="listbox" className="p-1.5">
            {options.map(o => {
              const active = value === o.value
              return (
                <button
                  key={o.value || '__empty__'}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => { onChange(o.value); setOpen(false) }}
                  className="w-full min-h-10 rounded-[8px] px-3 py-2 text-left text-[14px] leading-[1.35] transition-colors cursor-pointer"
                  style={{
                    color: active ? '#132008' : 'rgba(255,255,255,0.88)',
                    background: active ? 'var(--oc-lime)' : 'transparent',
                  }}
                >
                  {o.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
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

  const handleReset = async () => {
    if (!email) { setErr('Ingresá tu email para recuperar la contraseña.'); return }
    setLoading(true)
    setErr('')
    try {
      await sendPasswordResetEmail(auth, email)
      setResetSent(true)
    } catch {
      setErr('No encontramos una cuenta con ese email.')
    } finally {
      setLoading(false)
    }
  }

  if (resetMode) {
    return (
      <div>
        <div className="mb-1.5 text-[10px] uppercase tracking-[0.08em] text-[var(--oc-text-label)]">Recuperar acceso</div>
        <div className="text-white text-[23px] font-medium tracking-[-0.02em] mb-1.5">Resetear contraseña</div>
        {resetSent ? (
          <div className="mb-5 rounded-[10px] border border-[rgba(170,255,0,0.3)] bg-[rgba(170,255,0,0.07)] p-4 text-[13px] text-[var(--oc-lime)]">
            ✓ Te enviamos un email a <b>{email}</b> con el link para resetear tu contraseña.
          </div>
        ) : (
          <>
            <div className="mb-5 text-[13px] text-[var(--oc-text-muted)]">Ingresá tu email y te mandamos un link para crear una nueva contraseña.</div>
            <div className="mb-4">
              <Input placeholder="Correo electrónico" type="email" aria-label="Correo electrónico" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            {err && <div className="mb-3 text-[12px] text-[var(--color-oc-red)]">{err}</div>}
            <Button variant="primary" className="w-full justify-center mb-3" size="lg" onClick={handleReset} disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar email de recuperación →'}
            </Button>
          </>
        )}
        <button onClick={() => { setResetMode(false); setResetSent(false); setErr('') }} className="text-[12px] text-[rgba(255,255,255,0.45)] cursor-pointer bg-transparent border-none font-sans hover:text-white">← Volver al login</button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-1.5 text-[10px] uppercase tracking-[0.08em] text-[var(--oc-text-label)]">Bienvenido de vuelta</div>
      <div className="text-white text-[23px] font-medium tracking-[-0.02em] mb-1.5">Ingresá a tu cuenta</div>
      <div className="mb-6 text-[13px] text-[var(--oc-text-muted)]">
        ¿No tenés cuenta?{' '}
        <button onClick={onSwitch} className="text-oc-green cursor-pointer bg-none border-none font-sans">Registrate gratis</button>
      </div>
      <form onSubmit={e => { e.preventDefault(); submit() }}>
        <div className="flex flex-col gap-2.5 mb-4">
          <Input placeholder="Correo electrónico" type="email" aria-label="Correo electrónico" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
          <Input placeholder="Contraseña" type="password" aria-label="Contraseña" autoComplete="current-password" value={pass} onChange={e => setPass(e.target.value)} />
        </div>
        {err && <div className="mb-3 text-[12px] text-[var(--color-oc-red)]">{err}</div>}
        <Button type="submit" variant="primary" className="w-full justify-center mb-3" size="lg" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar →'}
        </Button>
      </form>
      <div className="text-center">
        <button onClick={() => { setResetMode(true); setErr('') }} className="cursor-pointer text-[12px] text-[rgba(170,255,0,0.72)] bg-transparent border-none font-sans hover:text-[var(--oc-lime)]">¿Olvidaste tu contraseña?</button>
      </div>
    </div>
  )
}

function RegisterForm({ initialRole }: { initialRole?: Role }) {
  const [step, setStep] = useState(0)
  const [creds, setCreds] = useState({ email: '', pass: '', confirm: '' })
  const [role, setRole] = useState<Role | null>(() => initialRole ?? readPersistedRole() ?? null)
  const [form, setForm] = useState({ fullName: '', birthDate: '2000-01-01', nationality: '', position: '' })
  const [isMinor, setIsMinor] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (initialRole) persistAuthIntent(initialRole)
  }, [initialRole])

  const checkBirth = (v: string) => {
    setForm(f => ({ ...f, birthDate: v }))
    if (v) {
      const born = new Date(v)
      if (isNaN(born.getTime())) {
        setErr('Fecha de nacimiento inválida.')
        setIsMinor(false)
        return
      }
      const age = Math.floor((Date.now() - born.getTime()) / 31_557_600_000)
      setIsMinor(age < 18)
      setErr('')
    }
  }

  const step0Submit = () => {
    if (!creds.email || !creds.pass || !creds.confirm) { setErr('Completá todos los campos.'); return }
    if (creds.pass !== creds.confirm) { setErr('Las contraseñas no coinciden.'); return }
    if (creds.pass.length < 6) { setErr('La contraseña debe tener al menos 6 caracteres.'); return }
    if (!role) { setErr('Elegí tu rol para continuar.'); return }
    setErr('')
    setStep(2)
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
      const selectedRole = role
      persistAuthIntent(selectedRole)
      setTimeout(() => router.push(getRoleDashboardPath(selectedRole)), 1800)
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Error al registrarse.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 3) {
    return (
      <div className="text-center py-5">
        <div className="text-[45px] mb-4">⚽</div>
        <div className="text-oc-green text-[21px] font-medium tracking-[-0.02em] mb-2">¡Perfil creado!</div>
        {isMinor ? (
          <div className="text-left">
            <div className="mb-4 rounded-[10px] border border-[rgba(255,180,0,0.3)] bg-[rgba(255,180,0,0.08)] p-4 text-[13px] leading-[1.7] text-[rgba(255,180,0,0.9)]">
              <div className="mb-1 font-medium">Tu perfil está pendiente de revisión</div>
              <p>Al ser menor de 18 años, un admin debe aprobarlo antes de que sea visible. Recibirás una notificación en tu email en las próximas <strong>48 horas hábiles</strong>.</p>
            </div>
            <Button variant="primary" size="sm" className="w-full justify-center mb-2" onClick={() => router.push('/dashboard')}>Ir a mi panel →</Button>
          </div>
        ) : (
          <p className="text-[13px] leading-[1.7] text-[var(--oc-text-muted)]">Redirigiendo a tu panel...</p>
        )}
      </div>
    )
  }

  return (
    <div>
      <StepDots total={3} current={step} />

      {step === 0 && (
        <>
          <div className="mb-1.5 text-[10px] uppercase tracking-[0.08em] text-[var(--oc-text-label)]">Paso 1 de 3</div>
          <div className="text-white text-[23px] font-medium tracking-[-0.02em] mb-5">Creá tu cuenta</div>
          <div className="flex flex-col gap-2.5 mb-4">
            <Input placeholder="Correo electrónico" type="email" aria-label="Correo electrónico" autoComplete="email" value={creds.email} onChange={e => setCreds(c => ({ ...c, email: e.target.value }))} />
            <Input placeholder="Contraseña (mínimo 6 caracteres)" type="password" aria-label="Contraseña" autoComplete="new-password" value={creds.pass} onChange={e => setCreds(c => ({ ...c, pass: e.target.value }))} />
            <div>
              <Input placeholder="Confirmá tu contraseña" type="password" aria-label="Confirmá tu contraseña" autoComplete="new-password" value={creds.confirm} onChange={e => setCreds(c => ({ ...c, confirm: e.target.value }))} />
              {creds.confirm && (
                <div className={`mt-1 text-[11px] ${creds.pass === creds.confirm ? 'text-[var(--oc-lime)]' : 'text-[var(--color-oc-red)]'}`}>
                  {creds.pass === creds.confirm ? '✓ Las contraseñas coinciden' : '✕ Las contraseñas no coinciden'}
                </div>
              )}
            </div>
            <div>
              <div className="mb-1.5 text-[10px] uppercase tracking-[0.06em] text-[var(--oc-text-label)]">Rol del perfil</div>
              <RoleSelect
                value={role ?? ''}
                onChange={(nextRole) => {
                  setRole(nextRole)
                  persistAuthIntent(nextRole)
                }}
              />
            </div>
          </div>
          {err && <div className="mb-2.5 text-[12px] text-[var(--color-oc-red)]">{err}</div>}
          <Button variant="primary" className="w-full justify-center" size="lg" onClick={step0Submit}>Continuar →</Button>
        </>
      )}

      {step === 1 && (
        <>
          <div className="mb-1.5 text-[10px] uppercase tracking-[0.08em] text-[var(--oc-text-label)]">Paso 2 de 3</div>
          <div className="text-white text-[23px] font-medium tracking-[-0.02em] mb-1.5">¿Quién sos?</div>
          <div className="mb-5 text-[13px] text-[var(--oc-text-muted)]">Elegí tu rol para personalizar tu perfil.</div>
          <div className="flex flex-col gap-2 mb-4">
            {ROLES.map(r => (
              <button
                key={r.id}
                onClick={() => { setRole(r.id as Role); setStep(2) }}
                className="flex items-center gap-3.5 text-left rounded-[10px] px-4 py-3 cursor-pointer font-sans transition-all duration-150 border"
                style={{
                   background: role === r.id ? 'rgba(170,255,0,0.1)' : 'var(--oc-surface-2)',
                   borderColor: role === r.id ? 'var(--oc-border-green)' : 'var(--oc-border-soft)',
                }}
              >
                <span className="text-[21px] shrink-0">{r.icon}</span>
                <div>
                  <div className="text-white text-[14px] font-medium">{r.title}</div>
                   <div className="mt-0.5 text-[11px] text-[var(--oc-text-muted)]">{r.desc}</div>
                </div>
                 <span className="ml-auto text-[14px] text-[var(--oc-text-faint)]">→</span>
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setStep(0)}>← Atrás</Button>
        </>
      )}

      {step === 2 && role && (
        <>
           <div className="mb-1.5 text-[10px] uppercase tracking-[0.08em] text-[var(--oc-text-label)]">
            Paso 3 de 3 · {ROLES.find(r => r.id === role)?.title}
          </div>
          <div className="text-white text-[23px] font-medium tracking-[-0.02em] mb-5">Tus datos</div>
          <div className="flex flex-col gap-2.5 mb-3.5">
            <Input placeholder="Nombre y apellido" aria-label="Nombre y apellido" autoComplete="name" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
            <RoleSelect
              value={role}
              onChange={(nextRole) => {
                setRole(nextRole)
                persistAuthIntent(nextRole)
              }}
            />
            <div>
               <div className="mb-1.5 text-[10px] uppercase tracking-[0.06em] text-[var(--oc-text-label)]">Fecha de nacimiento</div>
              <input
                type="date"
                value={form.birthDate}
                onChange={e => checkBirth(e.target.value)}
                min="1940-01-01"
                max={new Date().toISOString().split('T')[0]}
                className="w-full rounded-[8px] border border-[var(--oc-border-strong)] bg-[var(--oc-surface-2)] px-3 py-[9px] text-[13px] text-white outline-none focus-visible:border-[var(--oc-border-green)]"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            {isMinor && (
               <div className="flex items-start gap-2 rounded-[9px] border border-[var(--oc-border-yellow)] bg-[rgba(255,180,0,0.08)] p-[10px_13px]">
                <span className="text-[15px]">⚠️</span>
                 <div className="text-[12px] leading-[1.6] text-[rgba(255,180,0,0.92)]">
                  Sos menor de 18 años. Tu perfil quedará en revisión hasta que un admin lo apruebe.
                </div>
              </div>
            )}
            <DarkDropdown
              value={form.nationality}
              placeholder="Nacionalidad"
              onChange={next => setForm(f => ({ ...f, nationality: next }))}
              options={[{ value: '', label: 'Nacionalidad' }, ...COUNTRIES.map(c => ({ value: c, label: c }))]}
            />
            {role === 'player' && (
              <DarkDropdown
                value={form.position}
                placeholder="Puesto principal"
                onChange={next => setForm(f => ({ ...f, position: next }))}
                options={[{ value: '', label: 'Puesto principal' }, ...POSITIONS.map(p => ({ value: p, label: p }))]}
              />
            )}
          </div>
          {err && <div className="mb-2.5 text-[12px] text-[var(--color-oc-red)]">{err}</div>}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(0)} className="flex-1 justify-center">Atrás</Button>
            <Button variant="primary" onClick={step2Submit} className="flex-[2] justify-center" disabled={loading}>
              {loading ? 'Creando...' : 'Crear perfil →'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

const VALID_ROLES: Role[] = ['player', 'coach', 'club', 'agent']

function AuthContent() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login'
  const roleParam = searchParams.get('role')
  const [tab, setTab] = useState(initialTab)
  const { user } = useAuth()
  const router = useRouter()
  const queryRole = VALID_ROLES.includes(roleParam as Role) ? (roleParam as Role) : undefined
  const initialRole = queryRole ?? readPersistedRole()

  useEffect(() => {
    if (tab === 'register' && queryRole) persistAuthIntent(queryRole)
  }, [queryRole, tab])

  useEffect(() => {
    if (user) router.push('/dashboard')
  }, [user, router])

  return (
    <div className="relative min-h-screen">
      <div className="relative z-[2] pt-[calc(var(--oc-nav-height)+20px)] flex items-center justify-center min-h-screen px-[var(--oc-page-pad-x)] py-8">
        <div className="w-full max-w-[420px]">
          {/* Tab toggle */}
          <div className="mb-7 flex rounded-[10px] border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.08)] p-1 backdrop-blur-[10px]">
            {([['login','Ingresar'],['register','Crear cuenta']] as const).map(([t,l]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2 rounded-[7px] text-[13px] font-medium cursor-pointer font-sans transition-all duration-200 border-none"
                style={{
                  background: tab === t ? 'var(--oc-lime)' : 'transparent',
                  color: tab === t ? '#132008' : 'rgba(255,255,255,0.72)',
                }}
              >
                {l}
              </button>
            ))}
          </div>
          {/* Card */}
          <div className="rounded-[16px] border border-[rgba(170,255,0,0.24)] bg-[linear-gradient(165deg,rgba(20,35,18,0.2),rgba(15,22,18,0.3))] p-7 shadow-[0_24px_64px_rgba(0,0,0,0.5),0_0_0_1px_rgba(170,255,0,0.06),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[22px]">
            {tab === 'login'
              ? <LoginForm onSwitch={() => setTab('register')} />
              : <RegisterForm initialRole={initialRole} />
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
