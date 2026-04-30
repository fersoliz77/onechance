'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Background from '@/components/layout/Background'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { getPlayer, getCoach, getClub, getAgent, updatePlayer, updateCoach } from '@/lib/firestore'
import { getProfileState, updateProfileState, submitForReview, getVideos, addVideo, removeVideo, toggleVideoStatus } from '@/lib/rtdb'
import type { PlayerProfile, CoachProfile, ClubProfile, AgentProfile, ProfileState, VideoEntry } from '@/types'
import { POSITIONS, COUNTRIES, STATUS_META } from '@/types'

type AnyProfile = PlayerProfile | CoachProfile | ClubProfile | AgentProfile

function CompletionBar({ pct }: { pct: number }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-[rgba(255,255,255,0.35)] text-[10px]">Completud del perfil</span>
        <span className="text-[10px]" style={{ color: pct >= 80 ? '#00C853' : pct >= 50 ? '#FFB400' : '#FF6060' }}>{pct}%</span>
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
  const meta = STATUS_META[status]
  return (
    <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white text-[12px] font-medium">Estado del perfil</span>
        <Badge status={status} />
      </div>
      {state && <CompletionBar pct={state.completionPct} />}
      {status === 'draft' && (
        <div className="mt-4">
          <p className="text-[rgba(255,255,255,0.35)] text-[11px] mb-3">Tu perfil está en borrador. Completalo y envialo a revisión para que sea visible.</p>
          <Button variant="primary" size="sm" onClick={onSubmit} className="w-full justify-center">Enviar a revisión →</Button>
        </div>
      )}
      {status === 'pending' && (
        <p className="text-[rgba(255,180,0,0.7)] text-[11px] mt-3">Tu perfil está siendo revisado. Recibirás una notificación cuando sea aprobado.</p>
      )}
      {status === 'published' && (
        <p className="text-[rgba(0,200,83,0.7)] text-[11px] mt-3">Tu perfil está publicado y visible en la plataforma.</p>
      )}
      {status === 'rejected' && (
        <div className="mt-3">
          <p className="text-[rgba(255,60,60,0.7)] text-[11px] mb-3">Tu perfil fue rechazado. Revisá los datos, corregí lo necesario y volvé a enviarlo.</p>
          <Button variant="primary" size="sm" onClick={onSubmit} className="w-full justify-center">Reenviar →</Button>
        </div>
      )}
    </div>
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
    <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5">
      <div className="text-white text-[12px] font-medium mb-4">Editar perfil</div>
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
        <textarea
          placeholder="Descripción / Bio (opcional)"
          value={form.bio}
          onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          rows={3}
          className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-[8px] px-3 py-[9px] text-white text-[12px] outline-none resize-none placeholder:text-[rgba(255,255,255,0.25)]"
        />
      </div>
      <Button variant="primary" size="sm" className="mt-3 w-full justify-center" onClick={save} disabled={saving}>
        {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </div>
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
    <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5">
      <div className="text-white text-[12px] font-medium mb-4">Editar perfil</div>
      <div className="flex flex-col gap-2.5">
        <Input placeholder="Nombre completo" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
        <Select value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
          options={[{value:'',label:'Nacionalidad'},...COUNTRIES.map(c => ({value:c,label:c}))]} />
        <Input placeholder="Club actual" value={form.currentClub} onChange={e => setForm(f => ({ ...f, currentClub: e.target.value }))} />
        <Input placeholder="Años de experiencia" type="number" value={String(form.years)} onChange={e => setForm(f => ({ ...f, years: parseInt(e.target.value) || 0 }))} />
        <textarea
          placeholder="Bio / Descripción"
          value={form.bio}
          onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          rows={3}
          className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-[8px] px-3 py-[9px] text-white text-[12px] outline-none resize-none placeholder:text-[rgba(255,255,255,0.25)]"
        />
      </div>
      <Button variant="primary" size="sm" className="mt-3 w-full justify-center" onClick={save} disabled={saving}>
        {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </div>
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
    <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5">
      <div className="text-white text-[12px] font-medium mb-4">Mis videos</div>
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
                <div className="text-white text-[11px] truncate">{v.title}</div>
                <div className="text-[rgba(255,255,255,0.25)] text-[9px] truncate">{v.url}</div>
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
    </div>
  )
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<AnyProfile | null>(null)
  const [state, setState] = useState<ProfileState | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [tab, setTab] = useState<'overview' | 'edit' | 'videos'>('overview')

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
    if (!fn) { setLoadingProfile(false); return }
    Promise.all([fn(), getProfileState(user.uid)]).then(([p, s]) => {
      setProfile(p); setState(s); setLoadingProfile(false)
    })
  }, [user])

  const handleSubmit = async () => {
    if (!user || !profile) return
    await submitForReview(user.uid)
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
    { id:'overview', label:'Resumen' },
    { id:'edit', label:'Editar' },
    ...(user.role === 'player' ? [{ id:'videos', label:'Videos' }] : []),
  ] as { id: typeof tab; label: string }[]

  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-[2] pt-14">
        <div className="max-w-[860px] mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-[56px] h-[56px] rounded-full flex items-center justify-center text-[22px] border-[2px]"
              style={{ background: `linear-gradient(135deg,${accent},${accent}44)`, borderColor: `${accent}66` }}>
              {user.role === 'player' ? '⚽' : user.role === 'coach' ? '📋' : user.role === 'club' ? '🏟️' : '🤝'}
            </div>
            <div>
              <div className="text-white text-[18px] font-medium">{user.name || user.email}</div>
              <div className="text-[11px] mt-0.5" style={{ color: accent }}>{roleLabel[user.role ?? ''] ?? 'Usuario'}</div>
            </div>
            {profile && (
              <div className="ml-auto">
                <Badge status={profile.status} />
              </div>
            )}
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[10px] p-1 mb-6 w-fit">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="px-4 py-2 rounded-[7px] text-[11px] font-medium cursor-pointer font-sans transition-all duration-200 border-none"
                style={{ background: tab === t.id ? accent : 'transparent', color: tab === t.id ? (user.role === 'player' ? '#002A12' : '#000') : 'rgba(255,255,255,0.35)' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {tab === 'overview' && (
            <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 300px' }}>
              <div className="flex flex-col gap-4">
                {profile ? (
                  <StatusCard profile={profile} state={state} onSubmit={handleSubmit} />
                ) : (
                  <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5 text-[rgba(255,255,255,0.35)] text-[12px]">
                    No se encontró tu perfil. Intentá cerrar sesión y volver a ingresar.
                  </div>
                )}
                {user.role === 'player' && profile && (
                  <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5">
                    <div className="text-[rgba(255,255,255,0.2)] text-[9px] uppercase tracking-[0.07em] mb-3">Datos del jugador</div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ['Posición', (profile as PlayerProfile).position || '—'],
                        ['Nacionalidad', (profile as PlayerProfile).nationality || '—'],
                        ['Pie', (profile as PlayerProfile).strongFoot || '—'],
                        ['Club', (profile as PlayerProfile).currentClub || 'Libre'],
                      ].map(([l, v]) => (
                        <div key={l}>
                          <div className="text-[rgba(255,255,255,0.25)] text-[9px] uppercase tracking-[0.05em]">{l}</div>
                          <div className="text-white text-[12px] mt-0.5">{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-4">
                  <div className="text-[rgba(255,255,255,0.2)] text-[9px] uppercase tracking-[0.07em] mb-3">Acciones rápidas</div>
                  <div className="flex flex-col gap-2">
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
                </div>
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
              {(user.role === 'club' || user.role === 'agent') && (
                <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5 text-[rgba(255,255,255,0.35)] text-[12px]">
                  La edición completa para clubes y representantes estará disponible próximamente.
                </div>
              )}
            </div>
          )}

          {tab === 'videos' && user.role === 'player' && (
            <VideosSection uid={user.uid} />
          )}
        </div>
      </div>
    </div>
  )
}
