'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Background from '@/components/layout/Background'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import SurfaceCard from '@/components/ui/SurfaceCard'
import SectionKicker from '@/components/ui/SectionKicker'
import {
  getPlayer, getCoach, getClub, getAgent,
  updatePlayer, updateCoach, updateClub, updateAgent, setOwnProfileStatus,
} from '@/lib/firestore'
import {
  getProfileState, submitForReview, getVideos, addVideo, removeVideo, toggleVideoStatus,
  updateVisibility, getPhotos, addPhoto, removePhoto, type PhotoEntry,
} from '@/lib/rtdb'
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { calcCompletion } from '@/lib/profileCompletion'
import { ROLE_ACCENT, ROLE_ICONS, ROLE_LABELS, ROLE_ROUTE, MIN_COMPLETION_TO_SUBMIT } from '@/lib/constants'
import type { PlayerProfile, CoachProfile, ClubProfile, AgentProfile, ProfileState, VideoEntry, Role } from '@/types'
import { POSITIONS, COUNTRIES } from '@/types'

type AnyProfile = PlayerProfile | CoachProfile | ClubProfile | AgentProfile

// ── Completion bar ────────────────────────────────────────────
function CompletionBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? '#00C853' : pct >= 50 ? '#FFB400' : '#FF6060'
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-[rgba(255,255,255,0.35)] text-[11px]">Completud del perfil</span>
        <span className="text-[11px]" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-[4px] rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

// ── Status card ───────────────────────────────────────────────
function StatusCard({
  profile, role, onSubmit,
}: { profile: AnyProfile; state: ProfileState | null; role: Role; onSubmit: () => void }) {
  const status = profile.status
  const { pct, missing } = useMemo(() => calcCompletion(profile, role), [profile, role])
  const canSubmit = pct >= MIN_COMPLETION_TO_SUBMIT

  return (
    <SurfaceCard>
      <div className="flex items-center justify-between mb-3">
        <span className="text-white text-[13px] font-medium">Estado del perfil</span>
        <Badge status={status} />
      </div>
      <CompletionBar pct={pct} />

      {missing.length > 0 && (
        <div className="mt-3 rounded-[8px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] px-3 py-2.5">
          <div className="text-[rgba(255,255,255,0.3)] text-[9px] uppercase tracking-[0.07em] mb-1.5">Falta completar</div>
          <div className="flex flex-col gap-1">
            {missing.slice(0, 5).map(m => (
              <div key={m} className="flex items-center gap-2 text-[11px] text-[rgba(255,255,255,0.45)]">
                <span className="w-[5px] h-[5px] rounded-full bg-[rgba(255,100,100,0.6)] shrink-0" />
                {m}
              </div>
            ))}
            {missing.length > 5 && (
              <div className="text-[10px] text-[rgba(255,255,255,0.25)] mt-0.5">+{missing.length - 5} más</div>
            )}
          </div>
        </div>
      )}

      {(status === 'draft' || status === 'rejected') && (
        <div className="mt-4">
          {status === 'rejected' && (
            <p className="text-[rgba(255,60,60,0.7)] text-[12px] mb-3">Tu perfil fue rechazado. Corregí los datos y volvé a enviarlo.</p>
          )}
          {status === 'draft' && (
            <p className="text-[rgba(255,255,255,0.35)] text-[12px] mb-3">
              {canSubmit
                ? 'Tu perfil está listo para enviarse a revisión.'
                : `Completá al menos el ${MIN_COMPLETION_TO_SUBMIT}% del perfil antes de enviar.`}
            </p>
          )}
          <Button
            variant="primary" size="sm"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="w-full justify-center"
            title={!canSubmit ? `Necesitás ${MIN_COMPLETION_TO_SUBMIT}% de completud para enviar` : undefined}
          >
            {status === 'rejected' ? 'Reenviar a revisión →' : 'Enviar a revisión →'}
          </Button>
        </div>
      )}
      {status === 'pending' && (
        <p className="text-[rgba(255,180,0,0.7)] text-[12px] mt-3">Tu perfil está siendo revisado. Te notificaremos cuando sea aprobado.</p>
      )}
      {status === 'published' && (
        <p className="text-[rgba(0,200,83,0.7)] text-[12px] mt-3">Tu perfil está publicado y visible en la plataforma.</p>
      )}
    </SurfaceCard>
  )
}

// ── Player edit form ──────────────────────────────────────────
function PlayerEditForm({ player, uid, onSaved }: { player: PlayerProfile; uid: string; onSaved: (p: PlayerProfile) => void }) {
  const [form, setForm] = useState({
    fullName: player.fullName,
    bio: player.bio,
    position: player.position,
    nationality: player.nationality,
    currentClub: player.currentClub,
    height: player.height,
    weight: player.weight,
    strongFoot: player.strongFoot,
  })
  const [charInput, setCharInput] = useState('')
  const [chars, setChars] = useState<string[]>(player.characteristics ?? [])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const addChar = () => {
    const val = charInput.trim()
    if (!val || chars.includes(val)) return
    setChars(c => [...c, val])
    setCharInput('')
  }

  const save = async () => {
    setSaving(true)
    const data = { ...form, characteristics: chars } as Partial<PlayerProfile>
    await updatePlayer(uid, data)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onSaved({ ...player, ...data } as PlayerProfile)
  }

  return (
    <SurfaceCard>
      <div className="text-white text-[13px] font-medium mb-4">Editar perfil</div>
      <div className="flex flex-col gap-2.5">
        <Input placeholder="Nombre completo" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
        <Select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
          options={[{ value: '', label: 'Puesto' }, ...POSITIONS.map(p => ({ value: p, label: p }))]} />
        <Select value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
          options={[{ value: '', label: 'Nacionalidad' }, ...COUNTRIES.map(c => ({ value: c, label: c }))]} />
        <Select value={form.strongFoot} onChange={e => setForm(f => ({ ...f, strongFoot: e.target.value as typeof form.strongFoot }))}
          options={[{ value: 'Der', label: 'Pie derecho' }, { value: 'Izq', label: 'Pie izquierdo' }, { value: 'Ambas', label: 'Ambidiestro' }]} />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Altura (ej: 1.78)" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} />
          <Input placeholder="Peso (ej: 75)" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
        </div>
        <Input placeholder="Club actual (dejar vacío si libre)" value={form.currentClub} onChange={e => setForm(f => ({ ...f, currentClub: e.target.value }))} />
        <Textarea placeholder="Bio / Descripción" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} />

        {/* Características */}
        <div>
          <div className="text-[rgba(255,255,255,0.3)] text-[10px] uppercase tracking-[0.07em] mb-2">Características</div>
          <div className="flex gap-1.5 flex-wrap mb-2">
            {chars.map(c => (
              <span key={c} className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-[20px] bg-[rgba(0,200,83,0.1)] border border-[rgba(0,200,83,0.3)] text-[#00C853]">
                {c}
                <button onClick={() => setChars(cs => cs.filter(x => x !== c))} className="text-[10px] opacity-60 hover:opacity-100 cursor-pointer bg-transparent border-none text-current">✕</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Agregar característica..." value={charInput} onChange={e => setCharInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addChar())} />
            <Button variant="outline" size="sm" onClick={addChar} disabled={!charInput.trim()}>+</Button>
          </div>
        </div>
      </div>
      <Button variant="primary" size="sm" className="mt-3 w-full justify-center" onClick={save} disabled={saving}>
        {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </SurfaceCard>
  )
}

// ── Coach edit form ───────────────────────────────────────────
function CoachEditForm({ coach, uid, onSaved }: { coach: CoachProfile; uid: string; onSaved: (c: CoachProfile) => void }) {
  const [form, setForm] = useState({
    fullName: coach.fullName,
    bio: coach.bio,
    nationality: coach.nationality,
    currentClub: coach.currentClub,
    years: coach.years,
  })
  const [skills, setSkills] = useState<string[]>(coach.skills ?? [])
  const [skillInput, setSkillInput] = useState('')
  const [career, setCareer] = useState(coach.career ?? [])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const addSkill = () => {
    const val = skillInput.trim()
    if (!val || skills.includes(val)) return
    setSkills(s => [...s, val])
    setSkillInput('')
  }

  const addCareerEntry = () => setCareer(c => [...c, { club: '', role: '', years: '' }])
  const removeCareerEntry = (i: number) => setCareer(c => c.filter((_, idx) => idx !== i))
  const updateCareer = (i: number, field: 'club' | 'role' | 'years', value: string) =>
    setCareer(c => c.map((e, idx) => idx === i ? { ...e, [field]: value } : e))

  const save = async () => {
    setSaving(true)
    const data = { ...form, skills, career }
    await updateCoach(uid, data as Partial<CoachProfile>)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onSaved({ ...coach, ...data })
  }

  return (
    <SurfaceCard>
      <div className="text-white text-[13px] font-medium mb-4">Editar perfil</div>
      <div className="flex flex-col gap-2.5">
        <Input placeholder="Nombre completo" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
        <Select value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
          options={[{ value: '', label: 'Nacionalidad' }, ...COUNTRIES.map(c => ({ value: c, label: c }))]} />
        <Input placeholder="Club actual" value={form.currentClub} onChange={e => setForm(f => ({ ...f, currentClub: e.target.value }))} />
        <Input placeholder="Años de experiencia" type="number" value={String(form.years)} onChange={e => setForm(f => ({ ...f, years: parseInt(e.target.value) || 0 }))} />
        <Textarea placeholder="Bio / Descripción" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} />

        {/* Habilidades */}
        <div>
          <div className="text-[rgba(255,255,255,0.3)] text-[10px] uppercase tracking-[0.07em] mb-2">Habilidades</div>
          <div className="flex gap-1.5 flex-wrap mb-2">
            {skills.map(s => (
              <span key={s} className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-[20px] bg-[rgba(90,143,255,0.1)] border border-[rgba(90,143,255,0.3)] text-[#5A8FFF]">
                {s}
                <button onClick={() => setSkills(ss => ss.filter(x => x !== s))} className="text-[10px] opacity-60 hover:opacity-100 cursor-pointer bg-transparent border-none text-current">✕</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Agregar habilidad..." value={skillInput} onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
            <Button variant="outline" size="sm" onClick={addSkill} disabled={!skillInput.trim()}>+</Button>
          </div>
        </div>

        {/* Trayectoria */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[rgba(255,255,255,0.3)] text-[10px] uppercase tracking-[0.07em]">Trayectoria</div>
            <Button variant="ghost" size="sm" onClick={addCareerEntry} className="text-[10px] !py-1 !px-2">+ Agregar</Button>
          </div>
          <div className="flex flex-col gap-2">
            {career.map((entry, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_80px_28px] gap-1.5">
                <Input placeholder="Club" value={entry.club} onChange={e => updateCareer(i, 'club', e.target.value)} />
                <Input placeholder="Rol (ej: DT)" value={entry.role} onChange={e => updateCareer(i, 'role', e.target.value)} />
                <Input placeholder="Período" value={entry.years} onChange={e => updateCareer(i, 'years', e.target.value)} />
                <button onClick={() => removeCareerEntry(i)} className="text-[rgba(255,60,60,0.5)] hover:text-[#FF6060] text-[12px] cursor-pointer bg-transparent border-none flex items-center justify-center">✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Button variant="primary" size="sm" className="mt-3 w-full justify-center" onClick={save} disabled={saving}>
        {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </SurfaceCard>
  )
}

// ── Club edit form ────────────────────────────────────────────
function ClubEditForm({ club, uid, onSaved }: { club: ClubProfile; uid: string; onSaved: (c: ClubProfile) => void }) {
  const [form, setForm] = useState({
    name: club.name,
    country: club.country,
    city: club.city,
    division: club.division,
    currentCoach: club.currentCoach,
    bio: club.bio,
    founded: club.founded,
  })
  const [seeking, setSeeking] = useState<string[]>(club.seeking ?? [])
  const [seekInput, setSeekInput] = useState('')
  const [achievements, setAchievements] = useState<string[]>(club.achievements ?? [])
  const [achInput, setAchInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const DIVISIONS = ['Primera División', 'Segunda División', 'Tercera División', 'Liga Amateur', 'Juveniles', 'Femenino']

  const addSeeking = () => {
    const val = seekInput.trim()
    if (!val || seeking.includes(val)) return
    setSeeking(s => [...s, val])
    setSeekInput('')
  }
  const addAchievement = () => {
    const val = achInput.trim()
    if (!val) return
    setAchievements(a => [...a, val])
    setAchInput('')
  }

  const save = async () => {
    setSaving(true)
    const data = { ...form, seeking, achievements }
    await updateClub(uid, data as Partial<ClubProfile>)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onSaved({ ...club, ...data })
  }

  return (
    <SurfaceCard>
      <div className="text-white text-[13px] font-medium mb-4">Editar perfil del club</div>
      <div className="flex flex-col gap-2.5">
        <Input placeholder="Nombre del club" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <Select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
          options={[{ value: '', label: 'País' }, ...COUNTRIES.map(c => ({ value: c, label: c }))]} />
        <Input placeholder="Ciudad" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
        <Select value={form.division} onChange={e => setForm(f => ({ ...f, division: e.target.value }))}
          options={[{ value: '', label: 'División' }, ...DIVISIONS.map(d => ({ value: d, label: d }))]} />
        <Input placeholder="Director técnico" value={form.currentCoach} onChange={e => setForm(f => ({ ...f, currentCoach: e.target.value }))} />
        <Input placeholder="Año de fundación" type="number" value={form.founded ? String(form.founded) : ''} onChange={e => setForm(f => ({ ...f, founded: parseInt(e.target.value) || 0 }))} />
        <Textarea placeholder="Descripción institucional" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} />

        {/* Búsquedas activas */}
        <div>
          <div className="text-[rgba(255,255,255,0.3)] text-[10px] uppercase tracking-[0.07em] mb-2">Posiciones buscadas</div>
          <div className="flex gap-1.5 flex-wrap mb-2">
            {seeking.map(s => (
              <span key={s} className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-[20px] bg-[rgba(255,180,0,0.1)] border border-[rgba(255,180,0,0.3)] text-[#FFB400]">
                {s}
                <button onClick={() => setSeeking(ss => ss.filter(x => x !== s))} className="text-[10px] opacity-60 hover:opacity-100 cursor-pointer bg-transparent border-none text-current">✕</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Select value={seekInput} onChange={e => setSeekInput(e.target.value)}
              options={[{ value: '', label: 'Seleccionar posición...' }, ...POSITIONS.map(p => ({ value: p, label: p }))]} />
            <Button variant="outline" size="sm" onClick={addSeeking} disabled={!seekInput}>+</Button>
          </div>
        </div>

        {/* Logros */}
        <div>
          <div className="text-[rgba(255,255,255,0.3)] text-[10px] uppercase tracking-[0.07em] mb-2">Logros destacados</div>
          <div className="flex flex-col gap-1.5 mb-2">
            {achievements.map((a, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-[rgba(255,255,255,0.5)]">
                <span className="text-[13px]">🏆</span>
                <span className="flex-1">{a}</span>
                <button onClick={() => setAchievements(as => as.filter((_, idx) => idx !== i))} className="text-[rgba(255,60,60,0.4)] hover:text-[#FF6060] cursor-pointer bg-transparent border-none text-[12px]">✕</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Ej: Campeón Liga 2023" value={achInput} onChange={e => setAchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAchievement())} />
            <Button variant="outline" size="sm" onClick={addAchievement} disabled={!achInput.trim()}>+</Button>
          </div>
        </div>
      </div>
      <Button variant="primary" size="sm" className="mt-3 w-full justify-center" onClick={save} disabled={saving}>
        {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </SurfaceCard>
  )
}

// ── Agent edit form ───────────────────────────────────────────
function AgentEditForm({ agent, uid, onSaved }: { agent: AgentProfile; uid: string; onSaved: (a: AgentProfile) => void }) {
  const [form, setForm] = useState({
    fullName: agent.fullName,
    nationality: agent.nationality,
    agencyName: agent.agencyName,
    players: agent.players,
    countries: agent.countries,
    bio: agent.bio,
    career: agent.career,
  })
  const [markets, setMarkets] = useState<string[]>(agent.markets ?? [])
  const [marketInput, setMarketInput] = useState('')
  const [transfers, setTransfers] = useState<string[]>(agent.notableTransfers ?? [])
  const [transferInput, setTransferInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const addMarket = () => {
    const val = marketInput.trim()
    if (!val || markets.includes(val)) return
    setMarkets(m => [...m, val])
    setMarketInput('')
  }
  const addTransfer = () => {
    const val = transferInput.trim()
    if (!val) return
    setTransfers(t => [...t, val])
    setTransferInput('')
  }

  const save = async () => {
    setSaving(true)
    const data = { ...form, markets, notableTransfers: transfers }
    await updateAgent(uid, data as Partial<AgentProfile>)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onSaved({ ...agent, ...data })
  }

  return (
    <SurfaceCard>
      <div className="text-white text-[13px] font-medium mb-4">Editar perfil del representante</div>
      <div className="flex flex-col gap-2.5">
        <Input placeholder="Nombre completo" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
        <Select value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
          options={[{ value: '', label: 'Nacionalidad' }, ...COUNTRIES.map(c => ({ value: c, label: c }))]} />
        <Input placeholder="Nombre de agencia" value={form.agencyName} onChange={e => setForm(f => ({ ...f, agencyName: e.target.value }))} />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Jugadores representados" type="number" value={String(form.players)} onChange={e => setForm(f => ({ ...f, players: parseInt(e.target.value, 10) || 0 }))} />
          <Input placeholder="Países donde opera" type="number" value={String(form.countries)} onChange={e => setForm(f => ({ ...f, countries: parseInt(e.target.value, 10) || 0 }))} />
        </div>
        <Input placeholder="Trayectoria resumida" value={form.career} onChange={e => setForm(f => ({ ...f, career: e.target.value }))} />
        <Textarea placeholder="Bio / Descripción" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} />

        {/* Mercados */}
        <div>
          <div className="text-[rgba(255,255,255,0.3)] text-[10px] uppercase tracking-[0.07em] mb-2">Mercados donde opera</div>
          <div className="flex gap-1.5 flex-wrap mb-2">
            {markets.map(m => (
              <span key={m} className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-[20px] bg-[rgba(180,100,255,0.1)] border border-[rgba(180,100,255,0.3)] text-[#B464FF]">
                {m}
                <button onClick={() => setMarkets(ms => ms.filter(x => x !== m))} className="text-[10px] opacity-60 hover:opacity-100 cursor-pointer bg-transparent border-none text-current">✕</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Select value={marketInput} onChange={e => setMarketInput(e.target.value)}
              options={[{ value: '', label: 'País / Mercado...' }, ...COUNTRIES.map(c => ({ value: c, label: c }))]} />
            <Button variant="outline" size="sm" onClick={addMarket} disabled={!marketInput}>+</Button>
          </div>
        </div>

        {/* Transfers */}
        <div>
          <div className="text-[rgba(255,255,255,0.3)] text-[10px] uppercase tracking-[0.07em] mb-2">Transfers destacados</div>
          <div className="flex flex-col gap-1.5 mb-2">
            {transfers.map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-[rgba(255,255,255,0.5)]">
                <span className="w-[5px] h-[5px] rounded-full bg-[#B464FF] shrink-0" />
                <span className="flex-1">{t}</span>
                <button onClick={() => setTransfers(ts => ts.filter((_, idx) => idx !== i))} className="text-[rgba(255,60,60,0.4)] hover:text-[#FF6060] cursor-pointer bg-transparent border-none text-[12px]">✕</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Ej: Jugador X → Club Y (2024)" value={transferInput} onChange={e => setTransferInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTransfer())} />
            <Button variant="outline" size="sm" onClick={addTransfer} disabled={!transferInput.trim()}>+</Button>
          </div>
        </div>
      </div>
      <Button variant="primary" size="sm" className="mt-3 w-full justify-center" onClick={save} disabled={saving}>
        {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </SurfaceCard>
  )
}

// ── Videos section ────────────────────────────────────────────
function VideosSection({ uid }: { uid: string }) {
  const [videos, setVideos] = useState<VideoEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => { getVideos(uid).then(v => { setVideos(v); setLoading(false) }) }, [uid])

  const detectPlatform = (u: string): VideoEntry['platform'] => {
    if (u.includes('youtube') || u.includes('youtu.be')) return 'youtube'
    if (u.includes('vimeo')) return 'vimeo'
    if (u.includes('tiktok')) return 'tiktok'
    if (u.includes('instagram')) return 'instagram'
    return null
  }

  const handleAdd = async () => {
    if (!url.trim()) return
    setAdding(true)
    const id = await addVideo(uid, {
      type: 'embed', platform: detectPlatform(url),
      title: title || 'Sin título', url,
      storageRef: null, status: 'active', createdAt: new Date().toISOString(),
    })
    setVideos(v => [...v, { id, type: 'embed', platform: detectPlatform(url), title: title || 'Sin título', url, storageRef: null, status: 'active', createdAt: new Date().toISOString() }])
    setUrl(''); setTitle(''); setAdding(false)
  }

  const handleRemove = async (videoId: string) => {
    await removeVideo(uid, videoId)
    setVideos(v => v.filter(x => x.id !== videoId))
  }

  const handleToggle = async (v: VideoEntry) => {
    const next = v.status === 'active' ? 'hidden' : 'active'
    await toggleVideoStatus(uid, v.id, next)
    setVideos(vs => vs.map(x => x.id === v.id ? { ...x, status: next } : x))
  }

  const platformIcon = (p: VideoEntry['platform']) =>
    p === 'youtube' ? '▶' : p === 'vimeo' ? '🎬' : p === 'tiktok' ? '🎵' : p === 'instagram' ? '📸' : '🔗'

  return (
    <SurfaceCard>
      <div className="text-white text-[13px] font-medium mb-4">Mis videos</div>
      <div className="flex flex-col gap-2 mb-4">
        <Input placeholder="URL del video (YouTube, Vimeo, TikTok...)" value={url} onChange={e => setUrl(e.target.value)} />
        <Input placeholder="Título del video (opcional)" value={title} onChange={e => setTitle(e.target.value)} />
        <Button variant="outline" size="sm" onClick={handleAdd} disabled={adding || !url.trim()}>
          {adding ? 'Agregando...' : '+ Agregar video'}
        </Button>
      </div>
      {loading ? (
        <div className="text-[rgba(255,255,255,0.2)] text-[11px]">Cargando…</div>
      ) : videos.length === 0 ? (
        <div className="text-[rgba(255,255,255,0.2)] text-[11px] text-center py-4">No tenés videos agregados aún.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {videos.map(v => (
            <div key={v.id} className="flex items-center gap-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[9px] px-3 py-2.5">
              <span className="text-[14px] shrink-0">{platformIcon(v.platform)}</span>
              <div className="flex-1 min-w-0">
                <div className="text-white text-[12px] truncate">{v.title}</div>
                <div className="text-[rgba(255,255,255,0.25)] text-[10px] truncate">{v.url}</div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => handleToggle(v)} className="text-[9px] px-2 py-1 rounded-[5px] cursor-pointer"
                  style={{ background: v.status === 'active' ? 'rgba(0,200,83,0.12)' : 'rgba(255,255,255,0.05)', color: v.status === 'active' ? '#00C853' : 'rgba(255,255,255,0.3)' }}>
                  {v.status === 'active' ? 'Visible' : 'Oculto'}
                </button>
                <button onClick={() => handleRemove(v.id)} className="text-[9px] px-2 py-1 rounded-[5px] cursor-pointer bg-[rgba(255,60,60,0.08)] text-[rgba(255,60,60,0.6)]">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SurfaceCard>
  )
}

// ── Photos section ────────────────────────────────────────────
function PhotosSection({ uid }: { uid: string }) {
  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => { getPhotos(uid).then(p => { setPhotos(p); setLoading(false) }) }, [uid])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Solo se permiten imágenes JPG, PNG o WebP.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo no puede superar 5MB.')
      return
    }
    if (photos.length >= 10) {
      setError('Máximo 10 fotos por perfil.')
      return
    }
    setError(''); setUploading(true); setUploadProgress(0)
    const path = `photos/${uid}/${Date.now()}_${file.name}`
    const sRef = storageRef(storage, path)
    const task = uploadBytesResumable(sRef, file)
    task.on('state_changed',
      snap => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      () => { setError('Error al subir la foto.'); setUploading(false) },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        const id = await addPhoto(uid, { url, storagePath: path, createdAt: new Date().toISOString() })
        setPhotos(p => [...p, { id, url, storagePath: path, createdAt: new Date().toISOString() }])
        setUploading(false); setUploadProgress(0)
      },
    )
    e.target.value = ''
  }

  const handleRemove = async (photo: PhotoEntry) => {
    try {
      await deleteObject(storageRef(storage, photo.storagePath))
    } catch {
      // Storage object may not exist if manually deleted
    }
    await removePhoto(uid, photo.id)
    setPhotos(p => p.filter(x => x.id !== photo.id))
  }

  return (
    <SurfaceCard>
      <div className="flex items-center justify-between mb-4">
        <div className="text-white text-[13px] font-medium">Fotos del perfil</div>
        <span className="text-[rgba(255,255,255,0.25)] text-[10px]">{photos.length}/10</span>
      </div>
      {loading ? (
        <div className="text-[rgba(255,255,255,0.2)] text-[11px]">Cargando…</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
          {photos.map(p => (
            <div key={p.id} className="relative group aspect-square rounded-[9px] overflow-hidden border border-[rgba(255,255,255,0.08)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="Foto de perfil" className="w-full h-full object-cover" />
              <button
                onClick={() => handleRemove(p)}
                className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.6)] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none text-white text-[18px]"
                title="Eliminar foto"
              >
                🗑️
              </button>
            </div>
          ))}
          {photos.length < 10 && (
            <label className="aspect-square rounded-[9px] border-2 border-dashed border-[rgba(255,255,255,0.12)] flex flex-col items-center justify-center text-[rgba(255,255,255,0.25)] text-[11px] cursor-pointer hover:border-[rgba(255,255,255,0.25)] transition-colors">
              {uploading ? (
                <div className="text-center px-2">
                  <div className="text-[14px] mb-1">{uploadProgress}%</div>
                  <div className="text-[9px]">Subiendo…</div>
                </div>
              ) : (
                <>
                  <span className="text-[24px] leading-none mb-1">+</span>
                  <span>Subir foto</span>
                </>
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} disabled={uploading} />
            </label>
          )}
        </div>
      )}
      {error && <div className="text-[rgba(255,60,60,0.8)] text-[11px] mt-1">{error}</div>}
      <div className="text-[rgba(255,255,255,0.22)] text-[10px]">Max. 10 fotos · JPG, PNG o WebP · hasta 5MB cada una</div>
    </SurfaceCard>
  )
}

// ── Settings section ──────────────────────────────────────────
function SettingsSection({ uid, state, onStateChange }: { uid: string; state: ProfileState | null; onStateChange: (s: ProfileState) => void }) {
  const [saving, setSaving] = useState<string | null>(null)

  const vis = state?.visibility ?? { showContact: false, featured: false, notifications: true }

  const toggle = async (key: keyof typeof vis) => {
    if (!state) return
    setSaving(key)
    const newVis = { ...vis, [key]: !vis[key] }
    await updateVisibility(uid, newVis)
    onStateChange({ ...state, visibility: newVis })
    setSaving(null)
  }

  const settings: { key: keyof typeof vis; label: string; desc: string }[] = [
    { key: 'showContact', label: 'Visibilidad del contacto', desc: 'Muestra el botón "Contactar" en tu perfil público.' },
    { key: 'notifications', label: 'Notificaciones por email', desc: 'Recibí alertas cuando alguien te contacte o tu perfil sea aprobado.' },
  ]

  return (
    <SurfaceCard>
      <div className="text-white text-[13px] font-medium mb-4">Configuración</div>
      <div className="space-y-3">
        {settings.map(s => (
          <div key={s.key} className="flex items-start justify-between gap-4 py-2.5 border-b border-[rgba(255,255,255,0.05)] last:border-b-0">
            <div>
              <div className="text-[12px] text-[rgba(255,255,255,0.75)]">{s.label}</div>
              <div className="text-[10px] text-[rgba(255,255,255,0.3)] mt-0.5 leading-[1.5]">{s.desc}</div>
            </div>
            <button
              onClick={() => toggle(s.key)}
              disabled={saving === s.key}
              className="shrink-0 mt-0.5 w-9 h-5 rounded-full relative transition-all duration-200 cursor-pointer border-none"
              style={{
                background: vis[s.key] ? 'rgba(0,200,83,0.28)' : 'rgba(255,255,255,0.08)',
                border: vis[s.key] ? '1px solid rgba(0,200,83,0.4)' : '1px solid rgba(255,255,255,0.12)',
                opacity: saving === s.key ? 0.5 : 1,
              }}
              title={vis[s.key] ? 'Desactivar' : 'Activar'}
            >
              <span className="absolute top-[2px] h-[12px] w-[12px] rounded-full transition-all duration-200"
                style={{
                  left: vis[s.key] ? 'calc(100% - 14px)' : '2px',
                  background: vis[s.key] ? '#00C853' : 'rgba(255,255,255,0.35)',
                }} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.05)]">
        <div className="text-[rgba(255,255,255,0.3)] text-[10px] uppercase tracking-[0.07em] mb-2">Cuenta</div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-[11px] text-[rgba(255,60,60,0.6)] hover:text-[#FF6060]"
          onClick={() => {
            if (window.confirm('¿Estás seguro de que querés cerrar sesión?')) {
              import('@/lib/auth').then(({ logout }) => logout().then(() => window.location.href = '/'))
            }
          }}>
          Cerrar sesión
        </Button>
      </div>
    </SurfaceCard>
  )
}

// ── Main dashboard ────────────────────────────────────────────
export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<AnyProfile | null>(null)
  const [state, setState] = useState<ProfileState | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [tab, setTab] = useState<'overview' | 'edit' | 'videos' | 'photos' | 'settings'>('overview')

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth?tab=login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    const fetchers: Record<string, () => Promise<AnyProfile | null>> = {
      player: () => getPlayer(user.uid),
      coach:  () => getCoach(user.uid),
      club:   () => getClub(user.uid),
      agent:  () => getAgent(user.uid),
    }
    const fn = fetchers[user.role ?? '']
    if (!fn) { setTimeout(() => setLoadingProfile(false), 0); return }
    Promise.all([fn(), getProfileState(user.uid)]).then(([p, s]) => {
      setProfile(p); setState(s); setLoadingProfile(false)
    })
  }, [user])

  const handleSubmit = async () => {
    if (!user || !profile || !user.role) return
    await Promise.all([
      submitForReview(user.uid),
      setOwnProfileStatus(user.role, user.uid, 'pending'),
    ])
    setProfile(p => p ? { ...p, status: 'pending' } : null)
    setState(s => s ? { ...s, status: 'pending' } : null)
  }

  if (authLoading || loadingProfile) {
    return <div className="relative min-h-screen"><Background /><div className="relative z-[2] pt-28 text-center text-[rgba(255,255,255,0.2)]">Cargando…</div></div>
  }
  if (!user) return null

  const role = user.role as Role
  const accent = role ? ROLE_ACCENT[role] : '#00C853'
  const tabs = [
    { id: 'overview', icon: '◉', label: 'Mi perfil' },
    { id: 'edit',     icon: '✎', label: 'Editar datos' },
    ...(role === 'player' ? [{ id: 'videos', icon: '▶', label: 'Videos' }] : []),
    { id: 'photos',   icon: '□', label: 'Fotos' },
    { id: 'settings', icon: '⚙', label: 'Configuración' },
  ] as { id: typeof tab; icon: string; label: string }[]

  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-[2] oc-main-offset">
        <div className="oc-shell-content oc-page-block max-w-[980px]">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6 lg:mb-8">
            <div className="w-[56px] h-[56px] lg:w-[64px] lg:h-[64px] rounded-full flex items-center justify-center text-[22px] lg:text-[26px] border-[2px]"
              style={{ background: `linear-gradient(135deg,${accent},${accent}44)`, borderColor: `${accent}66` }}>
              {role ? ROLE_ICONS[role] : '👤'}
            </div>
            <div>
              <div className="text-white text-[20px] lg:text-[24px] font-medium">{user.name || user.email}</div>
              <div className="text-[12px] mt-0.5" style={{ color: accent }}>{role ? ROLE_LABELS[role] : 'Usuario'}</div>
            </div>
            {profile && (
              <div className="ml-auto">
                <Badge status={profile.status} />
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-[240px_1fr] gap-4 lg:gap-6 items-start">
            {/* Sidebar */}
            <aside className="w-full lg:w-[240px] shrink-0 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-[12px] overflow-hidden lg:sticky lg:top-[calc(var(--oc-nav-height)+var(--oc-space-4))]">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="w-full h-[44px] lg:h-[48px] px-3.5 lg:px-4 border-none border-b border-[rgba(255,255,255,0.04)] text-left cursor-pointer flex items-center gap-2.5"
                  style={{ background: tab === t.id ? `${accent}18` : 'transparent', boxShadow: tab === t.id ? `inset 2px 0 0 ${accent}` : 'none' }}>
                  <span className="text-[12px]" style={{ color: tab === t.id ? accent : 'rgba(255,255,255,0.28)' }}>{t.icon}</span>
                  <span className="text-[12px]" style={{ color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.42)' }}>{t.label}</span>
                </button>
              ))}
            </aside>

            {/* Content */}
            <div className="min-w-0 flex flex-col gap-4">
              {tab === 'overview' && (
                <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
                  <div className="flex flex-col gap-4">
                    {profile ? (
                      <StatusCard profile={profile} state={state} role={role} onSubmit={handleSubmit} />
                    ) : (
                      <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5 text-[rgba(255,255,255,0.35)] text-[12px]">
                        No se encontró tu perfil. Intentá cerrar sesión y volver a ingresar.
                      </div>
                    )}
                    {role === 'player' && profile && (
                      <SurfaceCard>
                        <SectionKicker className="mb-3">Datos del jugador</SectionKicker>
                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            ['Posición', (profile as PlayerProfile).position || '—'],
                            ['Nacionalidad', (profile as PlayerProfile).nationality || '—'],
                            ['Pie', (profile as PlayerProfile).strongFoot || '—'],
                            ['Club', (profile as PlayerProfile).currentClub || 'Libre'],
                          ].map(([l, v]) => (
                            <div key={l}>
                              <div className="text-[rgba(255,255,255,0.22)] text-[10px] uppercase tracking-[0.06em]">{l}</div>
                              <div className="text-white text-[13px] mt-0.5">{v}</div>
                            </div>
                          ))}
                        </div>
                      </SurfaceCard>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    <SurfaceCard className="p-4">
                      <SectionKicker className="mb-3">Acciones rápidas</SectionKicker>
                      <div className="flex flex-col gap-1.5">
                        {profile && role && (
                          <Button variant="ghost" size="sm" className="w-full justify-start text-[11px]"
                            onClick={() => router.push(`/${ROLE_ROUTE[role]}/${user.uid}`)}>
                            Ver mi perfil público →
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="w-full justify-start text-[11px]" onClick={() => setTab('edit')}>
                          Editar información →
                        </Button>
                        {role === 'player' && (
                          <Button variant="ghost" size="sm" className="w-full justify-start text-[11px]" onClick={() => setTab('videos')}>
                            Gestionar videos →
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="w-full justify-start text-[11px]" onClick={() => setTab('photos')}>
                          Gestionar fotos →
                        </Button>
                      </div>
                    </SurfaceCard>
                  </div>
                </div>
              )}

              {tab === 'edit' && profile && (
                <div>
                  {role === 'player' && <PlayerEditForm player={profile as PlayerProfile} uid={user.uid} onSaved={setProfile} />}
                  {role === 'coach'  && <CoachEditForm  coach={profile as CoachProfile}   uid={user.uid} onSaved={setProfile} />}
                  {role === 'club'   && <ClubEditForm   club={profile as ClubProfile}     uid={user.uid} onSaved={setProfile} />}
                  {role === 'agent'  && <AgentEditForm  agent={profile as AgentProfile}   uid={user.uid} onSaved={setProfile} />}
                </div>
              )}

              {tab === 'videos' && role === 'player' && <VideosSection uid={user.uid} />}

              {tab === 'photos' && <PhotosSection uid={user.uid} />}

              {tab === 'settings' && (
                <SettingsSection uid={user.uid} state={state} onStateChange={setState} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
