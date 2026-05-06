'use client'
import { useRouter } from 'next/navigation'
import Background from '@/components/layout/Background'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import ClubCard from '@/features/clubs/components/ClubCard'
import { DIVISIONS, emptyClubFilters, useClubsListing } from '@/features/clubs/hooks/useClubsListing'
import { COUNTRIES } from '@/types'

export default function ClubesPage() {
  const { clubs, visible, loading, search, setSearch, filters, setFilters } = useClubsListing()
  const router = useRouter()

  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-[2] oc-main-offset">
        <div className="oc-shell-content oc-page-block">
          <div className="mb-6 grid gap-4 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(10,16,24,0.9),rgba(8,13,20,0.82))] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] lg:grid-cols-[1fr_auto] lg:items-end lg:p-6">
            <div>
              <p className="inline-flex items-center gap-2 rounded-[20px] border border-[rgba(255,180,0,0.24)] bg-[rgba(255,180,0,0.08)] px-3 py-1 text-[10px] tracking-[0.08em] text-oc-yellow">
                <span className="h-1.5 w-1.5 rounded-full bg-oc-yellow" />
                {visible.length} CLUBES DISPONIBLES
              </p>
              <h1 className="mt-3 text-[34px] font-semibold tracking-[-0.04em] text-white sm:text-[40px]">Clubes</h1>
              <p className="mt-2 text-[13px] leading-[1.65] text-[var(--oc-text-muted)] sm:text-[14px]">Explora instituciones de futbol por pais, division y ciudad siguiendo la estetica deportiva de One Chance.</p>
            </div>
            <div className="w-full lg:w-[230px]">
              <p className="mb-1 text-[11px] text-[var(--oc-text-faint)]">Ordenar por</p>
              <Select
                defaultValue="relevantes"
                className="w-full"
                options={[
                  { value: 'relevantes', label: 'Mas relevantes' },
                  { value: 'nombre', label: 'Nombre A-Z' },
                  { value: 'fundacion', label: 'Fundacion reciente' },
                ]}
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[280px_1fr] lg:gap-5">
            <aside className="self-start rounded-[12px] border border-[var(--oc-border-soft)] bg-[rgba(10,18,26,0.86)] p-4 lg:sticky lg:top-[calc(var(--oc-nav-height)+var(--oc-space-4))]">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[14px] font-medium text-white">Filtros</span>
                <button onClick={() => setFilters(emptyClubFilters)} className="text-[11px] text-oc-yellow">Limpiar</button>
              </div>
              <div className="space-y-3.5">
                <Input placeholder="Buscar por nombre o ciudad..." value={search} onChange={e => setSearch(e.target.value)} icon="🔎" />
                <div>
                  <p className="mb-1.5 text-[11px] text-[var(--oc-text-faint)]">Pais</p>
                  <Select value={filters.country} onChange={e => setFilters({ ...filters, country: e.target.value })} options={[{ value: '', label: 'Todos los paises' }, ...COUNTRIES.map(c => ({ value: c, label: c }))]} />
                </div>
                <div>
                  <p className="mb-1.5 text-[11px] text-[var(--oc-text-faint)]">Division actual</p>
                  <Select value={filters.division} onChange={e => setFilters({ ...filters, division: e.target.value })} options={[{ value: '', label: 'Todas las divisiones' }, ...DIVISIONS.map(d => ({ value: d, label: d }))]} />
                </div>
                <Button variant="outline" size="sm" className="w-full justify-center" onClick={() => setFilters(emptyClubFilters)}>Limpiar filtros</Button>
              </div>

              <div className="mt-5 rounded-[10px] border border-[rgba(255,180,0,0.34)] bg-[rgba(255,180,0,0.08)] p-4">
                <h3 className="text-[17px] font-semibold text-white">Sos un club?</h3>
                <p className="mt-2 text-[12px] leading-[1.6] text-[var(--oc-text-muted)]">Publica tu perfil institucional y conecta con jugadores, tecnicos y representantes.</p>
                <Button className="mt-4 w-full justify-center" size="sm">Publicar club</Button>
              </div>
            </aside>

            <div className="flex-1">
              <p className="mb-3 text-[12px] text-[var(--oc-text-faint)]">{visible.length} resultados</p>
            {loading ? (
              <EmptyState message="Cargando clubes..." />
            ) : visible.length === 0 ? (
              <EmptyState message={clubs.length === 0 ? 'Aún no hay clubes registrados. Sé el primero.' : 'No se encontraron clubes con esos filtros.'} />
            ) : (
              <div className="space-y-3">
                {visible.map(c => <ClubCard key={c.uid} club={c} onClick={() => router.push(`/clubes/${c.uid}`)} />)}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
