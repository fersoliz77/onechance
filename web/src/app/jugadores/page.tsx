'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Background from '@/components/layout/Background'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { getPublishedPlayers } from '@/lib/firestore'
import type { PlayerProfile, Gender, AgeRange } from '@/types'
import { POSITIONS, COUNTRIES } from '@/types'

interface Filters { gender: string; ageRange: string; position: string; nationality: string; strongFoot: string }
const emptyFilters: Filters = { gender: '', ageRange: '', position: '', nationality: '', strongFoot: '' }

function PlayerCard({ p, onClick }: { p: PlayerProfile; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  const isFemale = p.gender === 'F'
  const accent = isFemale ? '#B464FF' : '#00C853'
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
      className="rounded-[12px] p-4 cursor-pointer transition-all duration-200 relative overflow-hidden"
      style={{ background: hov ? 'rgba(12,31,18,0.9)' : 'rgba(8,15,20,0.8)', border: `0.5px solid ${hov ? 'rgba(0,200,83,0.3)' : 'rgba(255,255,255,0.07)'}` }}
    >
      {p.isFeatured && <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-oc-green to-[rgba(0,200,83,0.2)]" />}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-[20px] border-[1.5px] shrink-0"
          style={{ background: `linear-gradient(135deg,${accent},${isFemale ? '#3A1A5A' : '#003A18'})`, borderColor: `${accent}66` }}>
          {isFemale ? '👩' : '👤'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-white text-[13px] font-medium">{p.fullName}</span>
            {p.isFeatured && <span className="bg-oc-green text-oc-green-dark text-[7px] font-medium px-[7px] py-[2px] rounded-[8px] tracking-[0.06em]">★ DEST.</span>}
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: accent }}>{p.position}</div>
        </div>
        <div className="rounded-[7px] px-[8px] py-[5px] text-center shrink-0" style={{ background: `${accent}1A` }}>
          <div className="text-[15px] font-medium leading-none" style={{ color: accent }}>{p.overall || '—'}</div>
          <div className="text-[rgba(255,255,255,0.2)] text-[7px] uppercase mt-0.5 tracking-[0.04em]">OVR</div>
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap mb-2.5">
        {[p.nationality, `${p.ageRange} años`, p.strongFoot === 'Der' ? '🦶Der' : '🦶Izq'].map(t => (
          <span key={t} className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-[5px] px-2 py-[3px] text-[rgba(255,255,255,0.4)] text-[9px]">{t}</span>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[rgba(255,255,255,0.25)] text-[10px]">{p.currentClub || 'Libre'}</span>
        <span className="text-[11px] transition-colors" style={{ color: hov ? '#00C853' : 'rgba(255,255,255,0.2)' }}>Ver perfil →</span>
      </div>
    </div>
  )
}

function FilterSidebar({ filters, setFilters }: { filters: Filters; setFilters: (f: Filters) => void }) {
  const Pills = ({ opts, key_ }: { opts: { value: string; label: string }[]; key_: keyof Filters }) => (
    <div className="flex gap-1.5 flex-wrap">
      {opts.map(o => (
        <div
          key={o.value} onClick={() => setFilters({ ...filters, [key_]: o.value })}
          className="px-[10px] py-1 rounded-[20px] text-[9px] cursor-pointer transition-all duration-150"
          style={{
            background: filters[key_] === o.value ? 'rgba(0,200,83,0.12)' : 'rgba(255,255,255,0.03)',
            border: `0.5px solid ${filters[key_] === o.value ? 'rgba(0,200,83,0.35)' : 'rgba(255,255,255,0.07)'}`,
            color: filters[key_] === o.value ? '#00C853' : 'rgba(255,255,255,0.35)',
          }}
        >
          {o.label}
        </div>
      ))}
    </div>
  )
  const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="mb-3.5">
      <div className="text-[rgba(255,255,255,0.2)] text-[9px] uppercase tracking-[0.07em] mb-1.5">{label}</div>
      {children}
    </div>
  )
  return (
    <aside className="w-[200px] shrink-0 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-[12px] p-4 sticky top-[72px] self-start">
      <div className="flex justify-between items-center mb-4">
        <span className="text-white text-[12px] font-medium">Filtros</span>
        <span onClick={() => setFilters(emptyFilters)} className="text-[rgba(0,200,83,0.6)] text-[10px] cursor-pointer">Limpiar</span>
      </div>
      <F label="Sexo">
        <Pills opts={[{value:'',label:'Todos'},{value:'M',label:'Masculino'},{value:'F',label:'Femenino'}]} key_="gender" />
      </F>
      <F label="Categoría">
        <Pills opts={[{value:'',label:'Todos'},{value:'13-17',label:'13–17'},{value:'18-22',label:'18–22'},{value:'23-30',label:'23–30'}]} key_="ageRange" />
      </F>
      <F label="Puesto">
        <Select value={filters.position} onChange={e => setFilters({ ...filters, position: e.target.value })}
          options={[{value:'',label:'Todos'},...POSITIONS.map(p => ({value:p,label:p}))]} />
      </F>
      <F label="Nacionalidad">
        <Select value={filters.nationality} onChange={e => setFilters({ ...filters, nationality: e.target.value })}
          options={[{value:'',label:'Todos'},...COUNTRIES.map(c => ({value:c,label:c}))]} />
      </F>
      <F label="Pierna">
        <Pills opts={[{value:'',label:'Todos'},{value:'Der',label:'Derecho'},{value:'Izq',label:'Izquierdo'}]} key_="strongFoot" />
      </F>
    </aside>
  )
}

export default function JugadoresPage() {
  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const router = useRouter()

  useEffect(() => {
    getPublishedPlayers().then(data => { setPlayers(data); setLoading(false) })
  }, [])

  const visible = players.filter(p => {
    if (filters.gender && p.gender !== filters.gender) return false
    if (filters.ageRange && p.ageRange !== filters.ageRange) return false
    if (filters.position && p.position !== filters.position) return false
    if (filters.nationality && p.nationality !== filters.nationality) return false
    if (filters.strongFoot && p.strongFoot !== filters.strongFoot) return false
    if (search && !p.fullName.toLowerCase().includes(search.toLowerCase()) && !p.position.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-[2] pt-14">
        <div className="max-w-[1100px] mx-auto px-6 py-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 bg-[rgba(0,200,83,0.08)] border border-[rgba(0,200,83,0.2)] rounded-[20px] px-3 py-1 mb-3.5">
              <div className="w-[5px] h-[5px] bg-oc-green rounded-full animate-blink" />
              <span className="text-oc-green text-[9px] tracking-[0.07em]">{visible.length} JUGADORES DISPONIBLES</span>
            </div>
            <h1 className="text-white text-[32px] font-medium tracking-[-0.03em] mb-1.5">Jugadores</h1>
            <p className="text-[rgba(255,255,255,0.35)] text-[13px]">Masculino y femenino · Todas las categorías · {COUNTRIES.length} países</p>
          </div>
          <Input placeholder="Buscar por nombre o puesto..." value={search} onChange={e => setSearch(e.target.value)} icon="⚽" wrapperClass="mb-6 max-w-[400px]" />
          <div className="flex gap-5 items-start">
            <FilterSidebar filters={filters} setFilters={setFilters} />
            <div className="flex-1">
              {loading ? (
                <div className="text-center py-16 text-[rgba(255,255,255,0.2)] text-[13px]">Cargando jugadores…</div>
              ) : visible.length === 0 ? (
                <div className="text-center py-16 text-[rgba(255,255,255,0.2)] text-[13px]">
                  {players.length === 0 ? 'Aún no hay jugadores registrados. ¡Sé el primero!' : 'No se encontraron jugadores con esos filtros.'}
                </div>
              ) : (
                <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))' }}>
                  {visible.map(p => <PlayerCard key={p.uid} p={p} onClick={() => router.push(`/jugadores/${p.uid}`)} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
