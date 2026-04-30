'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Background from '@/components/layout/Background'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { getPublishedCoaches } from '@/lib/firestore'
import type { CoachProfile } from '@/types'
import { COUNTRIES } from '@/types'

interface Filters { nationality: string; minYears: string }
const emptyFilters: Filters = { nationality: '', minYears: '' }

function CoachCard({ c, onClick }: { c: CoachProfile; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  const accent = '#5A8FFF'
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
      className="rounded-[12px] p-4 cursor-pointer transition-all duration-200 relative overflow-hidden"
      style={{ background: hov ? 'rgba(10,18,40,0.9)' : 'rgba(8,15,20,0.8)', border: `0.5px solid ${hov ? 'rgba(90,143,255,0.3)' : 'rgba(255,255,255,0.07)'}` }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-[20px] border-[1.5px] shrink-0"
          style={{ background: 'linear-gradient(135deg,#5A8FFF,#0B1A3A)', borderColor: 'rgba(90,143,255,0.4)' }}>
          📋
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-[13px] font-medium truncate">{c.fullName}</div>
          <div className="text-[10px] mt-0.5" style={{ color: accent }}>{c.currentClub || 'Sin club actual'}</div>
        </div>
        <div className="rounded-[7px] px-[8px] py-[5px] text-center shrink-0" style={{ background: 'rgba(90,143,255,0.12)' }}>
          <div className="text-[15px] font-medium leading-none" style={{ color: accent }}>{c.years || '—'}</div>
          <div className="text-[rgba(255,255,255,0.2)] text-[7px] uppercase mt-0.5 tracking-[0.04em]">AÑOS</div>
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap mb-2.5">
        {[c.nationality, ...(c.skills || []).slice(0, 2)].filter(Boolean).map(t => (
          <span key={t} className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-[5px] px-2 py-[3px] text-[rgba(255,255,255,0.4)] text-[9px]">{t}</span>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[rgba(255,255,255,0.25)] text-[10px]">{(c.languages || []).join(' · ') || 'Español'}</span>
        <span className="text-[11px] transition-colors" style={{ color: hov ? '#5A8FFF' : 'rgba(255,255,255,0.2)' }}>Ver perfil →</span>
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
            background: filters[key_] === o.value ? 'rgba(90,143,255,0.12)' : 'rgba(255,255,255,0.03)',
            border: `0.5px solid ${filters[key_] === o.value ? 'rgba(90,143,255,0.35)' : 'rgba(255,255,255,0.07)'}`,
            color: filters[key_] === o.value ? '#5A8FFF' : 'rgba(255,255,255,0.35)',
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
        <span onClick={() => setFilters(emptyFilters)} className="text-[rgba(90,143,255,0.6)] text-[10px] cursor-pointer">Limpiar</span>
      </div>
      <F label="Nacionalidad">
        <Select value={filters.nationality} onChange={e => setFilters({ ...filters, nationality: e.target.value })}
          options={[{value:'',label:'Todos'},...COUNTRIES.map(c => ({value:c,label:c}))]} />
      </F>
      <F label="Experiencia mínima">
        <Pills opts={[{value:'',label:'Todos'},{value:'5',label:'5+ años'},{value:'10',label:'10+ años'},{value:'15',label:'15+ años'}]} key_="minYears" />
      </F>
    </aside>
  )
}

export default function TecnicosPage() {
  const [coaches, setCoaches] = useState<CoachProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const router = useRouter()

  useEffect(() => {
    getPublishedCoaches().then(data => { setCoaches(data); setLoading(false) })
  }, [])

  const visible = coaches.filter(c => {
    if (filters.nationality && c.nationality !== filters.nationality) return false
    if (filters.minYears && (c.years || 0) < parseInt(filters.minYears)) return false
    if (search && !c.fullName.toLowerCase().includes(search.toLowerCase()) && !(c.currentClub || '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-[2] pt-14">
        <div className="max-w-[1100px] mx-auto px-6 py-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 bg-[rgba(90,143,255,0.08)] border border-[rgba(90,143,255,0.2)] rounded-[20px] px-3 py-1 mb-3.5">
              <div className="w-[5px] h-[5px] bg-oc-blue rounded-full animate-blink" />
              <span className="text-oc-blue text-[9px] tracking-[0.07em]">{visible.length} TÉCNICOS DISPONIBLES</span>
            </div>
            <h1 className="text-white text-[32px] font-medium tracking-[-0.03em] mb-1.5">Técnicos</h1>
            <p className="text-[rgba(255,255,255,0.35)] text-[13px]">Entrenadores y cuerpo técnico · Todas las categorías · {COUNTRIES.length} países</p>
          </div>
          <Input placeholder="Buscar por nombre o club..." value={search} onChange={e => setSearch(e.target.value)} icon="📋" wrapperClass="mb-6 max-w-[400px]" />
          <div className="flex gap-5 items-start">
            <FilterSidebar filters={filters} setFilters={setFilters} />
            <div className="flex-1">
              {loading ? (
                <div className="text-center py-16 text-[rgba(255,255,255,0.2)] text-[13px]">Cargando técnicos…</div>
              ) : visible.length === 0 ? (
                <div className="text-center py-16 text-[rgba(255,255,255,0.2)] text-[13px]">
                  {coaches.length === 0 ? 'Aún no hay técnicos registrados. ¡Sé el primero!' : 'No se encontraron técnicos con esos filtros.'}
                </div>
              ) : (
                <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))' }}>
                  {visible.map(c => <CoachCard key={c.uid} c={c} onClick={() => router.push(`/tecnicos/${c.uid}`)} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
