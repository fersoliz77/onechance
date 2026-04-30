'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Background from '@/components/layout/Background'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { getPublishedClubs } from '@/lib/firestore'
import type { ClubProfile } from '@/types'
import { COUNTRIES } from '@/types'

interface Filters { country: string; division: string }
const emptyFilters: Filters = { country: '', division: '' }

const DIVISIONS = ['Primera División','Segunda División','Tercera División','Liga Amateur','Juveniles','Femenino']

function ClubCard({ c, onClick }: { c: ClubProfile; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  const accent = '#FFB400'
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
      className="rounded-[12px] p-4 cursor-pointer transition-all duration-200 relative overflow-hidden"
      style={{ background: hov ? 'rgba(20,16,5,0.9)' : 'rgba(8,15,20,0.8)', border: `0.5px solid ${hov ? 'rgba(255,180,0,0.3)' : 'rgba(255,255,255,0.07)'}` }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-[22px] border-[1.5px] shrink-0"
          style={{ background: 'linear-gradient(135deg,#FFB400,#3A2800)', borderColor: 'rgba(255,180,0,0.4)' }}>
          🏟️
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-[13px] font-medium truncate">{c.name}</div>
          <div className="text-[10px] mt-0.5" style={{ color: accent }}>{c.division || 'Sin categoría'}</div>
        </div>
        {c.founded > 0 && (
          <div className="rounded-[7px] px-[8px] py-[5px] text-center shrink-0" style={{ background: 'rgba(255,180,0,0.12)' }}>
            <div className="text-[13px] font-medium leading-none" style={{ color: accent }}>{c.founded}</div>
            <div className="text-[rgba(255,255,255,0.2)] text-[7px] uppercase mt-0.5 tracking-[0.04em]">FUND.</div>
          </div>
        )}
      </div>
      <div className="flex gap-1.5 flex-wrap mb-2.5">
        {[c.country, c.city, c.province].filter(Boolean).map(t => (
          <span key={t} className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-[5px] px-2 py-[3px] text-[rgba(255,255,255,0.4)] text-[9px]">{t}</span>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[rgba(255,255,255,0.25)] text-[10px]">{c.seeking && c.seeking.length > 0 ? `Busca: ${c.seeking.slice(0,2).join(', ')}` : 'No especifica búsqueda'}</span>
        <span className="text-[11px] transition-colors" style={{ color: hov ? '#FFB400' : 'rgba(255,255,255,0.2)' }}>Ver perfil →</span>
      </div>
    </div>
  )
}

function FilterSidebar({ filters, setFilters }: { filters: Filters; setFilters: (f: Filters) => void }) {
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
        <span onClick={() => setFilters(emptyFilters)} className="text-[rgba(255,180,0,0.6)] text-[10px] cursor-pointer">Limpiar</span>
      </div>
      <F label="País">
        <Select value={filters.country} onChange={e => setFilters({ ...filters, country: e.target.value })}
          options={[{value:'',label:'Todos'},...COUNTRIES.map(c => ({value:c,label:c}))]} />
      </F>
      <F label="División">
        <Select value={filters.division} onChange={e => setFilters({ ...filters, division: e.target.value })}
          options={[{value:'',label:'Todas'},...DIVISIONS.map(d => ({value:d,label:d}))]} />
      </F>
    </aside>
  )
}

export default function ClubesPage() {
  const [clubs, setClubs] = useState<ClubProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const router = useRouter()

  useEffect(() => {
    getPublishedClubs().then(data => { setClubs(data); setLoading(false) })
  }, [])

  const visible = clubs.filter(c => {
    if (filters.country && c.country !== filters.country) return false
    if (filters.division && c.division !== filters.division) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !(c.city || '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-[2] pt-14">
        <div className="max-w-[1100px] mx-auto px-6 py-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 bg-[rgba(255,180,0,0.08)] border border-[rgba(255,180,0,0.2)] rounded-[20px] px-3 py-1 mb-3.5">
              <div className="w-[5px] h-[5px] bg-oc-yellow rounded-full animate-blink" />
              <span className="text-oc-yellow text-[9px] tracking-[0.07em]">{visible.length} CLUBES DISPONIBLES</span>
            </div>
            <h1 className="text-white text-[32px] font-medium tracking-[-0.03em] mb-1.5">Clubes</h1>
            <p className="text-[rgba(255,255,255,0.35)] text-[13px]">Instituciones de fútbol · Todas las divisiones · {COUNTRIES.length} países</p>
          </div>
          <Input placeholder="Buscar por nombre o ciudad..." value={search} onChange={e => setSearch(e.target.value)} icon="🏟️" wrapperClass="mb-6 max-w-[400px]" />
          <div className="flex gap-5 items-start">
            <FilterSidebar filters={filters} setFilters={setFilters} />
            <div className="flex-1">
              {loading ? (
                <div className="text-center py-16 text-[rgba(255,255,255,0.2)] text-[13px]">Cargando clubes…</div>
              ) : visible.length === 0 ? (
                <div className="text-center py-16 text-[rgba(255,255,255,0.2)] text-[13px]">
                  {clubs.length === 0 ? 'Aún no hay clubes registrados. ¡Sé el primero!' : 'No se encontraron clubes con esos filtros.'}
                </div>
              ) : (
                <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))' }}>
                  {visible.map(c => <ClubCard key={c.uid} c={c} onClick={() => router.push(`/clubes/${c.uid}`)} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
