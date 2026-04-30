'use client'
import { useEffect, useState } from 'react'
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
import { getPlayer, getCoach, getClub, getAgent, updatePlayer, updateCoach, updateClub, updateAgent, setOwnProfileStatus } from '@/lib/firestore'
import { getProfileState, submitForReview, getVideos, addVideo, removeVideo, toggleVideoStatus } from '@/lib/rtdb'
import type { PlayerProfile, CoachProfile, ClubProfile, AgentProfile, ProfileState, VideoEntry } from '@/types'
import { POSITIONS, COUNTRIES } from '@/types'

type AnyProfile = PlayerProfile | CoachProfile | ClubProfile | AgentProfile

function CompletionBar({ pct }: { pct: number }) {
  return (
    <div>
        <div className="flex justify-between mb-1.5">
          <span className="text-[rgba(255,255,255,0.35)] text-[11px] lg:text-[12px]">Completud del perfil</span>
          <span className="text-[11px] lg:text-[12px]" style={{ color: pct >= 80 ? '#00C853' : pct >= 50 ? '#FFB400' : '#FF6060' }}>{pct}%</span>
        </div>
      <div className="h-[4px] rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: pct >= 80 ? '#00C853' : pct >= 50 ? '#FFB400' : '#FF6060' }} />
      </div>
    </div>
  )
}

function StatusCard({ profile, state, onSubmit }: { profile: AnyProfile; state: ProfileState | null; onSubmit: () => void }) {
  const status = profile.status

  return (
    <SurfaceCard>
      <div className="flex items-center justify-between mb-3">
        <span className="text-white text-[13px] lg:text-[14px] font-medium">Estado del perfil</span>
        <Badge status={status} />
      </div>
      {state && <CompletionBar pct={state.completionPct} />}
      {status === 'draft' && (
        <div className="mt-4">
          <p className="text-[rgba(255,255,255,0.35)] text-[12px] lg:text-[13px] mb-3">Tu perfil está en borrador. Completalo y envialo a revisión para que sea visible.</p>
          <Button variant="primary" size="sm" onClick={onSubmit} className="w-full justify-center">Enviar a revisión →</Button>
        </div>
      )}
      {status === 'pending' && (
        <p className="text-[rgba(255,180,0,0.7)] text-[12px] lg:text-[13px] mt-3">Tu perfil está siendo revisado. Recibirás una notificación cuando sea aprobado.</p>
      )}
      {status === 'published' && (
        <p className="text-[rgba(0,200,83,0.7)] text-[12px] lg:text-[13px] mt-3">Tu perfil está publicado y visible en la plataforma.</p>
      )}
      {status === 'rejected' && (
        <div className="mt-3">
          <p className="text-[rgba(255,60,60,0.7)] text-[12px] lg:text-[13px] mb-3">Tu perfil fue rechazado. Revisá los datos, corregí lo necesario y volvé a enviarlo.</p>
          <Button variant="primary" size="sm" onClick={onSubmit} className="w-full justify-center">Reenviar →</Button>
        </div>
      )}
    </SurfaceCard>
  )
}

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
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async () => {
    setSaving(true)
    await updatePlayer(uid, form as Partial<PlayerProfile>)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onSaved({ ...player, ...form } as PlayerProfile)
  }

  return (
    <SurfaceCard>
      <div className="text-white text-[13px] lg:text-[14px] font-medium mb-4">Editar perfil</div>
      <div className="flex flex-col gap-2.5">
        <Input placeholder="Nombre completo" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
        <Select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
          options={[{value:'',label:'Puesto'},...POSITIONS.map(p => ({value:p,label:p}))]} />
        <Select value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
          options={[{value:'',label:'Nacionalidad'},...COUNTRIES.map(c => ({value:c,label:c}))]} />
        <Select value={form.strongFoot} onChange={e => setForm(f => ({ ...f, strongFoot: e.target.value as typeof form.strongFoot }))}
          options={[{value:'Der',label:'Pie derecho'},{value:'Izq',label:'Pie izquierdo'},{value:'Ambas',label:'Ambidiestro'}]} />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Altura (ej: 1.78)" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} />
          <Input placeholder="Peso (ej: 75)" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
        </div>
        <Input placeholder="Club actual (o dejar vacío si libre)" value={form.currentClub} onChange={e => setForm(f => ({ ...f, currentClub: e.target.value }))} />
        <Textarea
          placeholder="Descripción / Bio (opcional)"
          value={form.bio}
          onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          rows={3}
        />
      </div>
      <Button variant="primary" size="sm" className="mt-3 w-full justify-center" onClick={save} disabled={saving}>
        {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </SurfaceCard>
  )
}

function CoachEditForm({ coach, uid, onSaved }: { coach: CoachProfile; uid: string; onSaved: (c: CoachProfile) => void }) {
  const [form, setForm] = useState({
    fullName: coach.fullName,
    bio: coach.bio,
    nationality: coach.nationality,
    currentClub: coach.currentClub,
    years: coach.years,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async () => {
    setSaving(true)
    await updateCoach(uid, form as Partial<CoachProfile>)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onSaved({ ...coach, ...form })
  }

  return (
    <SurfaceCard>
      <div className="text-white text-[13px] lg:text-[14px] font-medium mb-4">Editar perfil</div>
      <div className="flex flex-col gap-2.5">
        <Input placeholder="Nombre completo" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
        <Select value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
          options={[{value:'',label:'Nacionalidad'},...COUNTRIES.map(c => ({value:c,label:c}))]} />
        <Input placeholder="Club actual" value={form.currentClub} onChange={e => setForm(f => ({ ...f, currentClub: e.target.value }))} />
        <Input placeholder="Años de experiencia" type="number" value={String(form.years)} onChange={e => setForm(f => ({ ...f, years: parseInt(e.target.value) || 0 }))} />
        <Textarea
          placeholder="Bio / Descripción"
          value={form.bio}
          onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          rows={3}
        />
      </div>
      <Button variant="primary" size="sm" className="mt-3 w-full justify-center" onClick={save} disabled={saving}>
        {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </SurfaceCard>
  )
}

function ClubEditForm({ club, uid, onSaved }: { club: ClubProfile; uid: string; onSaved: (c: ClubProfile) => void }) {
  const [form, setForm] = useState({
    name: club.name,
    country: club.country,
    city: club.city,
    division: club.division,
    currentCoach: club.currentCoach,
    bio: club.bio,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async () => {
    setSaving(true)
    await updateClub(uid, form as Partial<ClubProfile>)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onSaved({ ...club, ...form })
  }

  return (
    <SurfaceCard>
      <div className="text-white text-[13px] lg:text-[14px] font-medium mb-4">Editar perfil del club</div>
      <div className="flex flex-col gap-2.5">
        <Input placeholder="Nombre del club" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <Select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
          options={[{value:'',label:'País'},...COUNTRIES.map(c => ({value:c,label:c}))]} />
        <Input placeholder="Ciudad" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
        <Input placeholder="División" value={form.division} onChange={e => setForm(f => ({ ...f, division: e.target.value }))} />
        <Input placeholder="DT actual" value={form.currentCoach} onChange={e => setForm(f => ({ ...f, currentCoach: e.target.value }))} />
        <Textarea
          placeholder="Descripción institucional"
          value={form.bio}
          onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          rows={3}
        />
      </div>
      <Button variant="primary" size="sm" className="mt-3 w-full justify-center" onClick={save} disabled={saving}>
        {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </SurfaceCard>
  )
}

function AgentEditForm({ agent, uid, onSaved }: { agent: AgentProfile; uid: string; onSaved: (a: AgentProfile) => void }) {
  const [form, setForm] = useState({
    fullName: agent.fullName,
    nationality: agent.nationality,
    agencyName: agent.agencyName,
    players: agent.players,
    countries: agent.countries,
    bio: agent.bio,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async () => {
    setSaving(true)
    await updateAgent(uid, form as Partial<AgentProfile>)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onSaved({ ...agent, ...form })
  }

  return (
    <SurfaceCard>
      <div className="text-white text-[13px] lg:text-[14px] font-medium mb-4">Editar perfil del representante</div>
      <div className="flex flex-col gap-2.5">
        <Input placeholder="Nombre completo" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
        <Select value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
          options={[{value:'',label:'Nacionalidad'},...COUNTRIES.map(c => ({value:c,label:c}))]} />
        <Input placeholder="Nombre de agencia" value={form.agencyName} onChange={e => setForm(f => ({ ...f, agencyName: e.target.value }))} />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Jugadores" type="number" value={String(form.players)} onChange={e => setForm(f => ({ ...f, players: parseInt(e.target.value, 10) || 0 }))} />
          <Input placeholder="Países" type="number" value={String(form.countries)} onChange={e => setForm(f => ({ ...f, countries: parseInt(e.target.value, 10) || 0 }))} />
        </div>
        <Textarea
          placeholder="Descripción"
          value={form.bio}
          onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          rows={3}
        />
      </div>
      <Button variant="primary" size="sm" className="mt-3 w-full justify-center" onClick={save} disabled={saving}>
        {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </SurfaceCard>
  )
}

function VideosSection({ uid }: { uid: string }) {
  const [videos, setVideos] = useState<VideoEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    getVideos(uid).then(v => { setVideos(v); setLoading(false) })
  }, [uid])

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
      type: 'embed',
      platform: detectPlatform(url),
      title: title || 'Sin título',
      url,
      storageRef: null,
      status: 'active',
      createdAt: new Date().toISOString(),
    })
    setVideos(v => [...v, { id, type:'embed', platform:detectPlatform(url), title:title||'Sin título', url, storageRef:null, status:'active', createdAt:new Date().toISOString() }])
    setUrl(''); setTitle('')
    setAdding(false)
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

  const platformIcon = (p: VideoEntry['platform']) => p === 'youtube' ? '▶' : p === 'vimeo' ? '🎬' : p === 'tiktok' ? '🎵' : p === 'instagram' ? '📸' : '🔗'

  return (
    <SurfaceCard>
      <div className="text-white text-[13px] lg:text-[14px] font-medium mb-4">Mis videos</div>
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
            <div key={v.id} className="flex items-center gap-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[9px] px-3 py-2.5 lg:px-3.5 lg:py-3">
              <span className="text-[14px] shrink-0">{platformIcon(v.platform)}</span>
              <div className="flex-1 min-w-0">
                <div className="text-white text-[12px] lg:text-[13px] truncate">{v.title}</div>
                <div className="text-[rgba(255,255,255,0.25)] text-[10px] truncate">{v.url}</div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => handleToggle(v)}
                  className="text-[9px] px-2 py-1 rounded-[5px] cursor-pointer"
                  style={{ background: v.status === 'active' ? 'rgba(0,200,83,0.12)' : 'rgba(255,255,255,0.05)', color: v.status === 'active' ? '#00C853' : 'rgba(255,255,255,0.3)' }}
                >
                  {v.status === 'active' ? 'Visible' : 'Oculto'}
                </button>
                <button onClick={() => handleRemove(v.id)} className="text-[9px] px-2 py-1 rounded-[5px] cursor-pointer bg-[rgba(255,60,60,0.08)] text-[rgba(255,60,60,0.6)]">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SurfaceCard>
  )
}

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
      coach: () => getCoach(user.uid),
      club: () => getClub(user.uid),
      agent: () => getAgent(user.uid),
    }
    const fn = fetchers[user.role ?? '']
    if (!fn) {
      Promise.resolve().then(() => setLoadingProfile(false))
      return
    }
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

  const roleLabel: Record<string, string> = { player:'Jugador', coach:'Técnico', club:'Club', agent:'Representante' }
  const roleAccent: Record<string, string> = { player:'#00C853', coach:'#5A8FFF', club:'#FFB400', agent:'#B464FF' }
  const accent = roleAccent[user.role ?? ''] ?? '#00C853'
    const tabs = [
    { id:'overview', icon:'◉', label:'Mi perfil' },
    { id:'edit', icon:'✎', label:'Editar datos' },
    { id:'videos', icon:'▶', label:'Videos' },
    { id:'photos', icon:'□', label:'Fotos' },
    { id:'settings', icon:'⚙', label:'Configuración' },
  ] as { id: typeof tab; icon: string; label: string }[]

  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-[2] oc-main-offset">
        <div className="oc-shell-content oc-page-block max-w-[980px]">
          {/* Header */}
          <div className="flex items-center gap-4 lg:gap-5 mb-6 lg:mb-8">
            <div className="w-[56px] h-[56px] lg:w-[64px] lg:h-[64px] rounded-full flex items-center justify-center text-[22px] lg:text-[26px] border-[2px]"
              style={{ background: `linear-gradient(135deg,${accent},${accent}44)`, borderColor: `${accent}66` }}>
              {user.role === 'player' ? '⚽' : user.role === 'coach' ? '📋' : user.role === 'club' ? '🏟️' : '🤝'}
            </div>
              <div>
                <div className="text-white text-[20px] lg:text-[24px] font-medium">{user.name || user.email}</div>
                <div className="text-[12px] lg:text-[13px] mt-0.5" style={{ color: accent }}>{roleLabel[user.role ?? ''] ?? 'Usuario'}</div>
              </div>
            {profile && (
              <div className="ml-auto">
                <Badge status={profile.status} />
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-[240px_1fr] gap-4 lg:gap-6 items-start">
            <aside className="w-full lg:w-[240px] shrink-0 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-[12px] overflow-hidden lg:sticky lg:top-[calc(var(--oc-nav-height)+var(--oc-space-4))]">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="w-full h-[44px] lg:h-[48px] px-3.5 lg:px-4 border-none border-b border-[rgba(255,255,255,0.04)] text-left cursor-pointer flex items-center gap-2.5"
                  style={{ background: tab === t.id ? 'rgba(0,200,83,0.1)' : 'transparent', boxShadow: tab === t.id ? 'inset 2px 0 0 #00C853' : 'none' }}>
                  <span className="text-[12px] lg:text-[13px]" style={{ color: tab === t.id ? '#00C853' : 'rgba(255,255,255,0.28)' }}>{t.icon}</span>
                  <span className="text-[12px] lg:text-[13px]" style={{ color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.42)' }}>{t.label}</span>
                </button>
              ))}
            </aside>

            <div className="min-w-0 flex flex-col gap-4">
          {tab === 'overview' && (
            <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
              <div className="flex flex-col gap-4">
                {profile ? (
                  <StatusCard profile={profile} state={state} onSubmit={handleSubmit} />
                ) : (
                  <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5 text-[rgba(255,255,255,0.35)] text-[12px]">
                    No se encontró tu perfil. Intentá cerrar sesión y volver a ingresar.
                  </div>
                )}
                {user.role === 'player' && profile && (
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
                            <div className="text-white text-[13px] lg:text-[14px] mt-0.5">{v}</div>
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
                    {profile && (
                      <Button variant="ghost" size="sm" className="w-full justify-start text-[11px]"
                        onClick={() => router.push(`/${user.role === 'player' ? 'jugadores' : user.role === 'coach' ? 'tecnicos' : user.role === 'club' ? 'clubes' : 'representantes'}/${user.uid}`)}>
                        Ver mi perfil público →
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="w-full justify-start text-[11px]" onClick={() => setTab('edit')}>
                      Editar información →
                    </Button>
                    {user.role === 'player' && (
                      <Button variant="ghost" size="sm" className="w-full justify-start text-[11px]" onClick={() => setTab('videos')}>
                        Gestionar videos →
                      </Button>
                    )}
                  </div>
                </SurfaceCard>
              </div>
            </div>
          )}

          {tab === 'edit' && profile && (
            <div>
              {user.role === 'player' && (
                <PlayerEditForm player={profile as PlayerProfile} uid={user.uid} onSaved={setProfile} />
              )}
              {user.role === 'coach' && (
                <CoachEditForm coach={profile as CoachProfile} uid={user.uid} onSaved={setProfile} />
              )}
              {user.role === 'club' && (
                <ClubEditForm club={profile as ClubProfile} uid={user.uid} onSaved={setProfile} />
              )}
              {user.role === 'agent' && (
                <AgentEditForm agent={profile as AgentProfile} uid={user.uid} onSaved={setProfile} />
              )}
            </div>
          )}

          {tab === 'videos' && user.role === 'player' && (
            <VideosSection uid={user.uid} />
          )}

          {tab === 'photos' && (
            <SurfaceCard>
              <div className="text-white text-[13px] font-medium mb-4">Fotos del perfil</div>
              <div className="grid grid-cols-4 gap-3 mb-3">
                {[0, 1, 2].map(i => (
                  <div key={i} className="aspect-square rounded-[9px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[22px] text-[rgba(255,255,255,0.18)]">📷</div>
                ))}
                <div className="aspect-square rounded-[9px] border-2 border-dashed border-[rgba(255,255,255,0.12)] flex flex-col items-center justify-center text-[rgba(255,255,255,0.25)] text-[11px]">
                  <span className="text-[24px] leading-none mb-1">+</span>
                  Subir foto
                </div>
              </div>
              <div className="text-[rgba(255,255,255,0.22)] text-[10px]">Max. 10 fotos por perfil</div>
            </SurfaceCard>
          )}

          {tab === 'settings' && (
            <SurfaceCard>
              <div className="text-white text-[13px] font-medium mb-4">Configuración</div>
              <div className="space-y-3">
                {['Visibilidad del contacto', 'Perfil destacado (pago)', 'Notificaciones por email'].map(i => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.05)]">
                    <span className="text-[12px] text-[rgba(255,255,255,0.65)]">{i}</span>
                    <span className="w-9 h-5 rounded-full bg-[rgba(0,200,83,0.28)] border border-[rgba(0,200,83,0.4)] relative after:content-[''] after:absolute after:right-[2px] after:top-[2px] after:w-[12px] after:h-[12px] after:rounded-full after:bg-oc-green" />
                  </div>
                ))}
              </div>
            </SurfaceCard>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
