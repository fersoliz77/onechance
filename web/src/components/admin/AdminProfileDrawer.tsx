'use client'
import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { auth } from '@/lib/firebase'
import { ROLE_LABELS, ROLE_ACCENT } from '@/lib/constants'
import type { Role, PlayerProfile, CoachProfile, ClubProfile, AgentProfile } from '@/types'

type AnyProfile = PlayerProfile | CoachProfile | ClubProfile | AgentProfile
type Draft = Record<string, unknown>

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  profile: AnyProfile | null
  role:    Role | null
  onClose: () => void
  onSaved: () => void
}

// ── Small shared primitives ────────────────────────────────────────────────────

const inputCls =
  'w-full px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] text-white text-[13px] outline-none focus:border-[rgba(170,255,0,0.4)] focus:bg-[rgba(170,255,0,0.02)] placeholder:text-[rgba(255,255,255,0.2)] transition-colors'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.25)]">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[12px] font-medium text-[rgba(255,255,255,0.4)]">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text' }: {
  value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputCls}
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <textarea
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`${inputCls} resize-none`}
    />
  )
}

function SelectInput({ value, onChange, options }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      className={`${inputCls} cursor-pointer`}
      style={{ colorScheme: 'dark' }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value} className="bg-[#111] text-white">{o.label}</option>
      ))}
    </select>
  )
}

// ── Tag input ─────────────────────────────────────────────────────────────────

function TagInput({ value, onChange, placeholder }: {
  value: string[]; onChange: (v: string[]) => void; placeholder?: string
}) {
  const [input, setInput] = useState('')

  const add = () => {
    const t = input.trim()
    if (!t || value.includes(t)) { setInput(''); return }
    onChange([...value, t])
    setInput('')
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map(tag => (
            <span key={tag} className="flex items-center gap-1 text-[12px] px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.7)]">
              {tag}
              <button
                type="button"
                onClick={() => onChange(value.filter(t => t !== tag))}
                className="text-[rgba(255,255,255,0.3)] hover:text-white ml-0.5 cursor-pointer bg-transparent border-none leading-none"
              >×</button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder ?? 'Agregar…'}
          className={`${inputCls} flex-1`}
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 rounded-lg bg-[rgba(170,255,0,0.08)] border border-[rgba(170,255,0,0.2)] text-[#AAFF00] text-[13px] hover:bg-[rgba(170,255,0,0.15)] transition-colors cursor-pointer shrink-0"
        >+</button>
      </div>
    </div>
  )
}

// ── Read-only info chip ───────────────────────────────────────────────────────

function InfoChip({ label, value }: { label: string; value: string | number | boolean | undefined | null }) {
  if (value === undefined || value === null || value === '') return null
  const display = typeof value === 'boolean' ? (value ? 'Sí' : 'No') : String(value)
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[rgba(255,255,255,0.22)]">{label}</span>
      <span className="text-[12px] text-[rgba(255,255,255,0.55)]">{display}</span>
    </div>
  )
}

// ── Player career (club + years, no role) ─────────────────────────────────────

type PlayerCareerEntry = { club: string; years: string }

function PlayerCareerInput({ value, onChange }: {
  value: PlayerCareerEntry[]; onChange: (v: PlayerCareerEntry[]) => void
}) {
  const update = (i: number, field: keyof PlayerCareerEntry, v: string) => {
    const next = [...value]; next[i] = { ...next[i], [field]: v }; onChange(next)
  }
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i))
  const add    = () => onChange([...value, { club: '', years: '' }])

  return (
    <div className="space-y-2">
      {value.map((entry, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input value={entry.club}  onChange={e => update(i, 'club',  e.target.value)} placeholder="Club / equipo" className={`${inputCls} flex-1`} />
          <input value={entry.years} onChange={e => update(i, 'years', e.target.value)} placeholder="Período"        className={`${inputCls} w-28 shrink-0`} />
          <button type="button" onClick={() => remove(i)} className="text-[rgba(255,80,80,0.6)] hover:text-[#FF5050] cursor-pointer bg-transparent border-none text-lg leading-none shrink-0">×</button>
        </div>
      ))}
      <button type="button" onClick={add} className="text-[13px] text-[rgba(170,255,0,0.6)] hover:text-[#AAFF00] cursor-pointer bg-transparent border-none transition-colors">+ Agregar entrada</button>
    </div>
  )
}

// ── Coach career list ─────────────────────────────────────────────────────────

type CoachCareerEntry = { club: string; role: string; years: string }

function CoachCareerInput({ value, onChange }: {
  value: CoachCareerEntry[]; onChange: (v: CoachCareerEntry[]) => void
}) {
  const update = (i: number, field: keyof CoachCareerEntry, v: string) => {
    const next = [...value]
    next[i] = { ...next[i], [field]: v }
    onChange(next)
  }
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i))
  const add    = () => onChange([...value, { club: '', role: '', years: '' }])

  return (
    <div className="space-y-2">
      {value.map((entry, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input value={entry.club}  onChange={e => update(i, 'club',  e.target.value)} placeholder="Club"  className={`${inputCls} flex-1`} />
          <input value={entry.role}  onChange={e => update(i, 'role',  e.target.value)} placeholder="Rol"   className={`${inputCls} flex-1`} />
          <input value={entry.years} onChange={e => update(i, 'years', e.target.value)} placeholder="Años"  className={`${inputCls} w-20 shrink-0`} />
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-[rgba(255,80,80,0.6)] hover:text-[#FF5050] cursor-pointer bg-transparent border-none text-lg leading-none shrink-0"
          >×</button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-[13px] text-[rgba(170,255,0,0.6)] hover:text-[#AAFF00] cursor-pointer bg-transparent border-none transition-colors"
      >+ Agregar entrada</button>
    </div>
  )
}

// ── Per-role form sections ────────────────────────────────────────────────────

function PlayerForm({ d, set }: { d: Partial<PlayerProfile>; set: (k: string, v: unknown) => void }) {
  const social = d.social as { instagram?: string; tiktok?: string; youtube?: string } | undefined

  return (
    <>
      {/* Read-only system data */}
      <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.2)] mb-3">Datos del sistema (solo lectura)</p>
        <div className="grid grid-cols-3 gap-x-4 gap-y-3 sm:grid-cols-4">
          <InfoChip label="Estado"       value={d.status} />
          <InfoChip label="Género"       value={d.gender === 'M' ? 'Masculino' : d.gender === 'F' ? 'Femenino' : d.gender} />
          <InfoChip label="Nacimiento"   value={d.birthDate} />
          <InfoChip label="Rango edad"   value={d.ageRange} />
          <InfoChip label="Menor"        value={d.isMinor} />
          <InfoChip label="Overall"      value={d.overall} />
          <InfoChip label="Fotos"        value={d.photos} />
          <InfoChip label="Videos"       value={d.videos} />
        </div>
      </div>

      <Section title="Información básica">
        <Field label="Nombre completo">
          <TextInput value={d.fullName ?? ''} onChange={v => set('fullName', v)} placeholder="Nombre y apellido" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nacionalidad">
            <TextInput value={d.nationality ?? ''} onChange={v => set('nationality', v)} />
          </Field>
          <Field label="Club actual">
            <TextInput value={d.currentClub ?? ''} onChange={v => set('currentClub', v)} />
          </Field>
        </div>
        <Field label="Bio">
          <Textarea value={d.bio ?? ''} onChange={v => set('bio', v)} rows={4} placeholder="Descripción profesional…" />
        </Field>
      </Section>

      <Section title="Perfil deportivo">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Posición">
            <TextInput value={d.position ?? ''} onChange={v => set('position', v)} placeholder="Ej: Delantero" />
          </Field>
          <Field label="Pie dominante">
            <SelectInput
              value={d.strongFoot ?? 'Der'}
              onChange={v => set('strongFoot', v)}
              options={[
                { value: 'Der',   label: 'Derecho' },
                { value: 'Izq',   label: 'Izquierdo' },
                { value: 'Ambas', label: 'Ambos' },
              ]}
            />
          </Field>
          <Field label="Altura">
            <TextInput value={d.height ?? ''} onChange={v => set('height', v)} placeholder="1.78m" />
          </Field>
          <Field label="Peso">
            <TextInput value={d.weight ?? ''} onChange={v => set('weight', v)} placeholder="75kg" />
          </Field>
        </div>
      </Section>

      <Section title="Trayectoria">
        <PlayerCareerInput
          value={(d.career as PlayerCareerEntry[] | undefined) ?? []}
          onChange={v => set('career', v)}
        />
      </Section>

      <Section title="Características">
        <TagInput value={d.characteristics ?? []} onChange={v => set('characteristics', v)} placeholder="Agregar característica…" />
      </Section>

      <Section title="Idiomas">
        <TagInput value={d.languages ?? []} onChange={v => set('languages', v)} placeholder="Agregar idioma…" />
      </Section>

      <Section title="Redes sociales">
        <div className="grid grid-cols-1 gap-3">
          <Field label="Instagram">
            <TextInput
              value={social?.instagram ?? ''}
              onChange={v => set('social', { ...social, instagram: v })}
              placeholder="@usuario"
            />
          </Field>
          <Field label="TikTok">
            <TextInput
              value={social?.tiktok ?? ''}
              onChange={v => set('social', { ...social, tiktok: v })}
              placeholder="@usuario"
            />
          </Field>
          <Field label="YouTube">
            <TextInput
              value={social?.youtube ?? ''}
              onChange={v => set('social', { ...social, youtube: v })}
              placeholder="URL del canal"
            />
          </Field>
        </div>
      </Section>
    </>
  )
}

function CoachForm({ d, set }: { d: Partial<CoachProfile>; set: (k: string, v: unknown) => void }) {
  return (
    <>
      <Section title="Información básica">
        <Field label="Nombre completo">
          <TextInput value={d.fullName ?? ''} onChange={v => set('fullName', v)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nacionalidad">
            <TextInput value={d.nationality ?? ''} onChange={v => set('nationality', v)} />
          </Field>
          <Field label="Club actual">
            <TextInput value={d.currentClub ?? ''} onChange={v => set('currentClub', v)} />
          </Field>
          <Field label="Años de experiencia">
            <TextInput type="number" value={d.years ?? 0} onChange={v => set('years', Number(v))} />
          </Field>
          <Field label="Edad">
            <TextInput type="number" value={d.age ?? 0} onChange={v => set('age', Number(v))} />
          </Field>
        </div>
        <Field label="Bio">
          <Textarea value={d.bio ?? ''} onChange={v => set('bio', v)} rows={4} />
        </Field>
      </Section>

      <Section title="Habilidades">
        <TagInput value={d.skills ?? []} onChange={v => set('skills', v)} placeholder="Agregar habilidad…" />
      </Section>

      <Section title="Idiomas">
        <TagInput value={d.languages ?? []} onChange={v => set('languages', v)} placeholder="Agregar idioma…" />
      </Section>

      <Section title="Logros">
        <TagInput value={d.trophies ?? []} onChange={v => set('trophies', v)} placeholder="Agregar trofeo / logro…" />
      </Section>

      <Section title="Trayectoria">
        <CoachCareerInput
          value={(d.career as CoachCareerEntry[] | undefined) ?? []}
          onChange={v => set('career', v)}
        />
      </Section>
    </>
  )
}

function ClubForm({ d, set }: { d: Partial<ClubProfile>; set: (k: string, v: unknown) => void }) {
  return (
    <>
      <Section title="Información básica">
        <Field label="Nombre del club">
          <TextInput value={d.name ?? ''} onChange={v => set('name', v)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="País">
            <TextInput value={d.country ?? ''} onChange={v => set('country', v)} />
          </Field>
          <Field label="Ciudad">
            <TextInput value={d.city ?? ''} onChange={v => set('city', v)} />
          </Field>
          <Field label="Provincia / Estado">
            <TextInput value={d.province ?? ''} onChange={v => set('province', v)} />
          </Field>
          <Field label="División">
            <TextInput value={d.division ?? ''} onChange={v => set('division', v)} />
          </Field>
        </div>
        <Field label="Descripción">
          <Textarea value={d.bio ?? ''} onChange={v => set('bio', v)} rows={4} />
        </Field>
      </Section>

      <Section title="Organización">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Presidente">
            <TextInput value={d.president ?? ''} onChange={v => set('president', v)} />
          </Field>
          <Field label="Director deportivo">
            <TextInput value={d.currentDirector ?? ''} onChange={v => set('currentDirector', v)} />
          </Field>
          <Field label="DT actual">
            <TextInput value={d.currentCoach ?? ''} onChange={v => set('currentCoach', v)} />
          </Field>
          <Field label="Año de fundación">
            <TextInput type="number" value={d.founded ?? ''} onChange={v => set('founded', Number(v))} />
          </Field>
        </div>
      </Section>

      <Section title="Buscando">
        <TagInput value={d.seeking ?? []} onChange={v => set('seeking', v)} placeholder="Posición que buscan…" />
      </Section>

      <Section title="Logros">
        <TagInput value={d.achievements ?? []} onChange={v => set('achievements', v)} placeholder="Agregar logro…" />
      </Section>
    </>
  )
}

function AgentForm({ d, set }: { d: Partial<AgentProfile>; set: (k: string, v: unknown) => void }) {
  return (
    <>
      <Section title="Información básica">
        <Field label="Nombre completo">
          <TextInput value={d.fullName ?? ''} onChange={v => set('fullName', v)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nacionalidad">
            <TextInput value={d.nationality ?? ''} onChange={v => set('nationality', v)} />
          </Field>
          <Field label="Agencia">
            <TextInput value={d.agencyName ?? ''} onChange={v => set('agencyName', v)} />
          </Field>
          <Field label="Jugadores representados">
            <TextInput type="number" value={d.players ?? 0} onChange={v => set('players', Number(v))} />
          </Field>
          <Field label="Países">
            <TextInput type="number" value={d.countries ?? 0} onChange={v => set('countries', Number(v))} />
          </Field>
        </div>
        <Field label="Bio">
          <Textarea value={d.bio ?? ''} onChange={v => set('bio', v)} rows={4} />
        </Field>
      </Section>

      <Section title="Trayectoria">
        <Field label="Resumen de carrera">
          <Textarea value={(d.career as string | undefined) ?? ''} onChange={v => set('career', v)} rows={3} placeholder="Descripción de la trayectoria…" />
        </Field>
      </Section>

      <Section title="Mercados">
        <TagInput value={d.markets ?? []} onChange={v => set('markets', v)} placeholder="Agregar mercado…" />
      </Section>

      <Section title="Transfers notables">
        <TagInput value={d.notableTransfers ?? []} onChange={v => set('notableTransfers', v)} placeholder="Agregar transfer…" />
      </Section>
    </>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function AdminProfileDrawer({ profile, role, onClose, onSaved }: Props) {
  const [draft,   setDraft]   = useState<Draft>({})
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [saved,   setSaved]   = useState(false)

  useEffect(() => {
    if (!profile) return
    const id = window.setTimeout(() => {
      setDraft({ ...profile })
      setError('')
      setSaved(false)
    }, 0)
    return () => window.clearTimeout(id)
  }, [profile])

  const set = useCallback((k: string, v: unknown) => {
    setDraft(prev => ({ ...prev, [k]: v }))
  }, [])

  const handleSave = async () => {
    if (!profile || !role || saving) return
    setSaving(true)
    setError('')
    try {
      const token = await auth.currentUser?.getIdToken()
      const res   = await fetch('/api/admin/profile-update', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ uid: profile.uid, role, data: draft }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Error al guardar')
      setSaved(true)
      setTimeout(() => { onSaved(); onClose() }, 1000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

  if (!profile || !role) return null

  const accent = ROLE_ACCENT[role]
  const label  = ROLE_LABELS[role]
  const name   = role === 'club'
    ? (profile as ClubProfile).name
    : (profile as PlayerProfile | CoachProfile | AgentProfile).fullName

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[400]"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', animation: 'oc-fadeIn 0.2s ease both' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 z-[401] h-full w-full max-w-[580px] bg-[#0D0D0D] border-l border-[rgba(255,255,255,0.08)] flex flex-col shadow-[−40px_0_80px_rgba(0,0,0,0.5)]"
        style={{ animation: 'oc-slideInRight 0.28s cubic-bezier(0.32,0.72,0,1) both' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[rgba(255,255,255,0.07)] shrink-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-black shrink-0"
            style={{ background: `linear-gradient(135deg,${accent}55,${accent}22)`, color: accent, border: `1px solid ${accent}44` }}
          >
            {(name?.[0] ?? '?').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-[15px] truncate">{name}</p>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ color: accent, background: `${accent}18` }}
            >{label}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[rgba(255,255,255,0.3)] hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-all cursor-pointer bg-transparent border-none"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {role === 'player' && <PlayerForm d={draft as Partial<PlayerProfile>} set={set} />}
          {role === 'coach'  && <CoachForm  d={draft as Partial<CoachProfile>}  set={set} />}
          {role === 'club'   && <ClubForm   d={draft as Partial<ClubProfile>}   set={set} />}
          {role === 'agent'  && <AgentForm  d={draft as Partial<AgentProfile>}  set={set} />}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-[rgba(255,255,255,0.07)] flex items-center gap-3">
          <div className="flex-1 min-w-0">
            {error && <p className="text-[12px] text-red-400 truncate">{error}</p>}
            {saved && <p className="text-[12px] text-[#AAFF00]">Cambios guardados ✓</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] text-[13px] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all cursor-pointer bg-transparent shrink-0"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || saved}
            className="px-5 py-2 rounded-lg bg-[rgba(170,255,0,0.1)] border border-[rgba(170,255,0,0.28)] text-[#AAFF00] text-[13px] font-medium hover:bg-[rgba(170,255,0,0.18)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
          >
            {saving && <span className="w-3 h-3 rounded-full border-[1.5px] border-t-transparent border-[#AAFF00] animate-spin" />}
            {saved ? 'Guardado ✓' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </>
  )
}
